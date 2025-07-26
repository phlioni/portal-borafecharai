import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// --- CONFIGURAÇÃO INICIAL ---
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// --- FUNÇÕES AUXILIARES ---
async function sendTelegramMessage(chatId, text, replyMarkup = {}) {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
    disable_web_page_preview: true
  };
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Telegram:", error);
  }
}
async function answerCallbackQuery(callbackQueryId, text = '') {
  const url = `https://api.telegram.org/bot${telegramBotToken}/answerCallbackQuery`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text
      })
    });
  } catch (error) {
    console.error("Erro ao enviar answerCallbackQuery:", error);
  }
}
async function showProposalSummary(session, chatId) {
  await supabase.from('telegram_sessions').update({
    step: 'awaiting_proposal_confirmation'
  }).eq('id', session.id);
  const proposalData = session.session_data.proposal;
  let summary = `📝 <b>Resumo da Proposta</b> 📝\n\n`;
  summary += `<b>Título:</b> ${proposalData.title}\n`;
  summary += `<b>Cliente:</b> ${proposalData.client_name || 'Cliente a ser criado'}\n`;
  summary += `<b>Resumo:</b> ${proposalData.summary}\n`;
  summary += `<b>Prazo:</b> ${proposalData.delivery_time}\n`;
  summary += `<b>Validade:</b> ${proposalData.validity_days} dias\n`;
  summary += `<b>Pagamento:</b> ${proposalData.payment_terms}\n\n`;
  summary += `<b>Itens do Orçamento:</b>\n`;
  let totalValue = 0;
  (proposalData.budget_items || []).forEach((item) => {
    const quantity = item.quantity || 0;
    const unit_price = item.unit_price || 0;
    const itemTotal = quantity * unit_price;
    totalValue += itemTotal;
    summary += `  - [${item.type}] ${item.description} (${quantity}x R$ ${unit_price.toFixed(2)}) = R$ ${itemTotal.toFixed(2)}\n`;
  });
  summary += `\n<b>Valor Total: R$ ${totalValue.toFixed(2)}</b>\n\n`;
  summary += `Tudo certo?`;
  proposalData.total_value = totalValue;
  await supabase.from('telegram_sessions').update({
    session_data: session.session_data
  }).eq('id', session.id);
  await sendTelegramMessage(chatId, summary, {
    inline_keyboard: [
      [
        {
          text: '✅ Salvar como Rascunho',
          callback_data: 'proposal_confirm:save'
        }
      ],
      [
        {
          text: '🚀 Salvar e Enviar por E-mail',
          callback_data: 'proposal_confirm:send'
        }
      ]
    ]
  });
}
// --- NOVAS FUNÇÕES DE IA ---
async function transcribeAudio(file_id) {
  const fileInfoUrl = `https://api.telegram.org/bot${telegramBotToken}/getFile?file_id=${file_id}`;
  const fileInfoResponse = await fetch(fileInfoUrl);
  const fileInfo = await fileInfoResponse.json();
  if (!fileInfo.ok) throw new Error("Não foi possível obter informações do arquivo do Telegram.");
  const filePath = fileInfo.result.file_path;
  const fileUrl = `https://api.telegram.org/file/bot${telegramBotToken}/${filePath}`;
  const audioResponse = await fetch(fileUrl);
  const audioBlob = await audioResponse.blob();
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.oga');
  formData.append('model', 'whisper-1');
  const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`
    },
    body: formData
  });
  const transcriptionResult = await whisperResponse.json();
  if (transcriptionResult.error) throw new Error(`Erro na transcrição: ${transcriptionResult.error.message}`);
  return transcriptionResult.text;
}
async function extractProposalDetails(text) {
  const systemPrompt = `Você é um assistente especialista em analisar textos e extrair informações para preencher uma proposta comercial. Analise o texto fornecido pelo usuário e extraia as seguintes informações: "summary" (resumo do escopo), "delivery_time" (prazo de entrega), "validity_days" (validade em DIAS, apenas o número), "payment_terms" (condições de pagamento), e "budget_items" (uma lista de itens, cada um com "type" ('material' ou 'labor'), "description", "quantity", e "unit_price"). Responda APENAS com um objeto JSON. Se uma informação não for encontrada, use o valor null.`;
  const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: {
        type: 'json_object'
      }
    })
  });
  const gptResult = await gptResponse.json();
  if (gptResult.error) throw new Error(`Erro na análise do GPT: ${gptResult.error.message}`);
  return JSON.parse(gptResult.choices[0].message.content);
}
async function showAiSummaryAndAskForEdit(session, chatId) {
  const extractedData = session.session_data.proposal;
  let summary = "🤖 A IA entendeu o seguinte da sua proposta:\n\n";
  summary += `<b>Escopo:</b> ${extractedData.summary || '<i>Não encontrado</i>'}\n`;
  summary += `<b>Prazo de Entrega:</b> ${extractedData.delivery_time || '<i>Não encontrado</i>'}\n`;
  summary += `<b>Validade:</b> ${extractedData.validity_days || '<i>Não encontrado</i>'} dias\n`;
  summary += `<b>Pagamento:</b> ${extractedData.payment_terms || '<i>Não encontrado</i>'}\n`;
  if (extractedData.budget_items?.length > 0) {
    summary += `\n<b>Itens Identificados:</b>\n`;
    (extractedData.budget_items || []).forEach((item) => {
      const quantity = item.quantity || 'N/A';
      const unit_price = item.unit_price || 0;
      summary += `  - ${item.description} (Qtd: ${quantity}, Valor: R$ ${unit_price.toFixed(2)})\n`;
    });
  } else {
    summary += `\n<b>Itens:</b> Nenhum item identificado.\n`;
  }
  summary += `\nEstá tudo correto ou deseja editar algum campo?`;
  await supabase.from('telegram_sessions').update({
    step: 'awaiting_edit_confirmation',
    session_data: session.session_data
  }).eq('id', session.id);
  await sendTelegramMessage(chatId, summary, {
    inline_keyboard: [
      [
        {
          text: '✅ Sim, está correto!',
          callback_data: 'edit_proposal:confirm'
        }
      ],
      [
        {
          text: '✏️ Não, quero editar',
          callback_data: 'edit_proposal:start_edit'
        }
      ]
    ]
  });
}
// --- SERVIDOR PRINCIPAL DO WEBHOOK ---
serve(async (req) => {
  try {
    const update = await req.json();
    if (update.callback_query) {
      const { id: callbackQueryId, from, message, data } = update.callback_query;
      const chatId = message.chat.id;
      const telegramUserId = from.id;
      await answerCallbackQuery(callbackQueryId);
      try {
        let { data: session } = await supabase.from('telegram_sessions').select('*').eq('chat_id', chatId).eq('telegram_user_id', telegramUserId).maybeSingle();
        if (!session) {
          return new Response('OK');
        }
        const [action, value] = data.split(':');
        if (action === 'main_choice') {
          if (value === 'create_proposal') {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_proposal_title',
              session_data: {
                proposal: {
                  budget_items: []
                }
              }
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Excelente! ✨\n\nQual será o <b>título</b> desta nova proposta?');
          } else if (value === 'view_proposals') {
            await sendTelegramMessage(chatId, 'Buscando suas 10 últimas propostas... ⏳');
            // AJUSTE: Selecionar o 'public_hash' para montar o link correto
            const { data: proposals, error } = await supabase.from('proposals').select(`id, public_hash, title, value, status, client:clients (name)`).eq('user_id', session.user_id).order('created_at', {
              ascending: false
            }).limit(10);
            if (error || !proposals || proposals.length === 0) {
              await sendTelegramMessage(chatId, 'Não encontrei nenhuma proposta recente ou ocorreu um erro.');
            } else {
              let proposalList = '<b>Suas 10 últimas propostas:</b>\n\n';
              for (const p of proposals) {
                const statusMap = {
                  rascunho: 'Rascunho',
                  enviada: 'Enviada',
                  visualizada: 'Visualizada',
                  aceita: 'Aceita',
                  rejeitada: 'Rejeitada'
                };
                const statusText = statusMap[p.status] || p.status.charAt(0).toUpperCase() + p.status.slice(1);
                let statusEmoji = '';
                if (p.status === 'rascunho') {
                  statusEmoji = '📝 ';
                } else if (p.status === 'enviada') {
                  statusEmoji = '📧 ';
                }
                proposalList += `${statusEmoji}<b>${p.title}</b>\n`;
                proposalList += `<i>Status:</i> ${statusText}\n`;
                if (p.client) proposalList += `<i>Cliente:</i> ${p.client.name}\n`;
                proposalList += `<i>Valor:</i> R$ ${p.value?.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                }) || 'N/D'}\n`;
                // AJUSTE: Usar o 'public_hash' no link
                proposalList += `<a href="https://www.borafecharai.com/proposta/${p.public_hash}">Ver Proposta</a>\n\n`;
              }
              await sendTelegramMessage(chatId, proposalList);
            }
          }
        }
        if (action === 'use_template') {
          if (value === 'none') {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_budget_item'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Ok, vamos começar do zero. Envie um ou mais itens separados por ponto e vírgula (<b>;</b>).\n\n<u>Formato por item:</u>\n<code>Tipo, Descrição, Quantidade, Valor (ex: 25.50)</code>\n\n<b>IMPORTANTE:</b> O "Tipo" deve ser <b>Material</b> ou <b>Serviço</b>.');
          } else {
            const templateId = value;
            const { data: template } = await supabase.from('budget_templates').select('name, items:budget_template_items(type, description)').eq('id', templateId).single();
            if (!template || !template.items || template.items.length === 0) {
              await sendTelegramMessage(chatId, '❌ Não foi possível carregar os itens deste modelo. Vamos começar do zero.');
              await supabase.from('telegram_sessions').update({
                step: 'awaiting_budget_item'
              }).eq('id', session.id);
              await sendTelegramMessage(chatId, 'Envie o primeiro item no formato:\n\n<code>Tipo, Descrição, Quantidade, Valor (ex: 25.50)</code>\n\n<b>IMPORTANTE:</b> O "Tipo" deve ser <b>Material</b> ou <b>Serviço</b>.');
            } else {
              const templateItems = template.items;
              let listMessage = `Ok, você selecionou o modelo "<b>${template.name}</b>".\nEle contém os seguintes itens:\n\n`;
              templateItems.forEach((item) => {
                listMessage += `• ${item.description}\n`;
              });
              listMessage += `\nAgora, vamos definir as quantidades e valores.`;
              await sendTelegramMessage(chatId, listMessage);
              session.session_data.proposal.template_items = templateItems;
              session.session_data.proposal.current_item_index = 0;
              await supabase.from('telegram_sessions').update({
                step: 'awaiting_template_item_details',
                session_data: session.session_data
              }).eq('id', session.id);
              const firstItem = templateItems[0];
              await sendTelegramMessage(chatId, `Item 1 de ${templateItems.length}: <b>${firstItem.description}</b>\n\nEnvie a <b>Quantidade</b> e o <b>Valor Unitário</b>, separados por vírgula.\n\nExemplo: <code>1, 2500.00 (use . para centavos)</code>`);
            }
          }
        }
        if (action === 'save_template') {
          if (value === 'yes') {
            const { count } = await supabase.from('budget_templates').select('*', {
              count: 'exact',
              head: true
            }).eq('user_id', session.user_id);
            if (count !== null && count >= 15) {
              await sendTelegramMessage(chatId, '❌ Você atingiu o limite de 15 Modelos de Orçamento.');
              await showProposalSummary(session, chatId);
            } else {
              await supabase.from('telegram_sessions').update({
                step: 'awaiting_template_name'
              }).eq('id', session.id);
              await sendTelegramMessage(chatId, 'Ótimo! Qual nome você quer dar a este Modelo de Orçamento?\n\n(Ex: Instalação de Câmeras)');
            }
          } else {
            await showProposalSummary(session, chatId);
          }
        }
        if (action === 'confirm_client') {
          if (value === 'yes') {
            session.session_data.proposal.client_id = session.session_data.found_client.id;
            session.session_data.proposal.client_name = session.session_data.found_client.name;
            delete session.session_data.found_client;
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_proposal_method',
              session_data: session.session_data
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, `Cliente definido! 👍\n\nComo você prefere detalhar a proposta?`, {
              inline_keyboard: [
                [
                  {
                    text: '🎙️ Enviar um Áudio',
                    callback_data: 'proposal_method:audio'
                  }
                ],
                [
                  {
                    text: '✍️ Digitar passo a passo',
                    callback_data: 'proposal_method:text'
                  }
                ]
              ]
            });
          } else {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_client_info'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Ok. Por favor, digite os dados do cliente novamente:\n\n<code>Nome Completo, email, telefone</code>');
          }
        }
        if (action === 'proposal_method') {
          if (value === 'audio') {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_proposal_audio'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Ótimo! Envie um áudio explicando o que será feito, prazo de entrega, validade da proposta, formas de pagamento e os itens do orçamento.');
          } else {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_service_summary'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Ok, vamos passo a passo. Por favor, digite um <b>resumo do que será feito</b> (escopo):');
          }
        }
        if (action === 'edit_proposal') {
          if (value === 'confirm') {
            await showProposalSummary(session, chatId);
          } else {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_edit_method_choice'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Como você prefere corrigir as informações?', {
              inline_keyboard: [
                [
                  {
                    text: '🎙️ Gravar novo áudio',
                    callback_data: 'edit_method:audio'
                  }
                ],
                [
                  {
                    text: '✏️ Editar campos por texto',
                    callback_data: 'edit_method:text'
                  }
                ]
              ]
            });
          }
        }
        if (action === 'edit_method') {
          if (value === 'audio') {
            const { proposal, ...rest } = session.session_data;
            const { summary, delivery_time, validity_days, payment_terms, budget_items, ...proposalRest } = proposal;
            session.session_data = {
              ...rest,
              proposal: {
                ...proposalRest,
                budget_items: []
              }
            };
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_proposal_audio',
              session_data: session.session_data
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Ok, por favor, envie um novo áudio com as informações corrigidas.');
          } else {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_edit_choice'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'O que você gostaria de editar?', {
              inline_keyboard: [
                [
                  {
                    text: 'Escopo (Resumo)',
                    callback_data: 'edit_choice:summary'
                  }
                ],
                [
                  {
                    text: 'Prazo de Entrega',
                    callback_data: 'edit_choice:delivery_time'
                  }
                ],
                [
                  {
                    text: 'Validade (dias)',
                    callback_data: 'edit_choice:validity_days'
                  }
                ],
                [
                  {
                    text: 'Pagamento',
                    callback_data: 'edit_choice:payment_terms'
                  }
                ],
                [
                  {
                    text: 'Itens do Orçamento',
                    callback_data: 'edit_choice:budget_items'
                  }
                ]
              ]
            });
          }
        }
        if (action === 'edit_choice') {
          const fieldMap = {
            summary: {
              step: 'awaiting_new_scope_value',
              prompt: 'Digite o novo <b>Escopo (resumo)</b>:'
            },
            delivery_time: {
              step: 'awaiting_new_delivery_time_value',
              prompt: 'Digite o novo <b>Prazo de Entrega</b>:'
            },
            validity_days: {
              step: 'awaiting_new_validity_days_value',
              prompt: 'Digite a nova <b>Validade (apenas dias)</b>:'
            },
            payment_terms: {
              step: 'awaiting_new_payment_terms_value',
              prompt: 'Digite as novas <b>Formas de Pagamento</b>:'
            },
            budget_items: {
              step: 'awaiting_budget_item',
              prompt: 'Ok, vamos refazer os itens. Envie um ou mais itens separados por ponto e vírgula (<b>;</b>).\n\n<u>Formato por item:</u>\n<code>Tipo, Descrição, Qtd, Valor (ex: 25.50)</code>\n\n<b>IMPORTANTE:</b> O "Tipo" deve ser <b>Material</b> ou <b>Serviço</b>.'
            }
          };
          const editSelection = fieldMap[value];
          if (editSelection) {
            if (value === 'budget_items') {
              session.session_data.proposal.budget_items = [];
              session.session_data.editing_ia = true;
            }
            await supabase.from('telegram_sessions').update({
              step: editSelection.step,
              session_data: session.session_data
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, editSelection.prompt);
          }
        }
        if (action === 'proposal_confirm') {
          await sendTelegramMessage(chatId, `Ok, processando sua proposta... (Isso pode levar um momento)`);
          const proposalData = session.session_data.proposal;
          let clientId = proposalData.client_id;
          let clientData = {};
          if (proposalData.new_client && !clientId) {
            const { data: newClient, error: clientError } = await supabase.from('clients').insert({
              name: proposalData.new_client.name,
              email: proposalData.new_client.email,
              phone: proposalData.new_client.phone,
              user_id: session.user_id
            }).select().single();
            if (clientError) throw new Error(`Erro ao criar cliente: ${clientError.message}`);
            clientId = newClient.id;
            clientData = newClient;
          } else {
            const { data: existingClient } = await supabase.from('clients').select('*').eq('id', clientId).single();
            if (!existingClient) throw new Error('Cliente existente não encontrado.');
            clientData = existingClient;
          }
          const validityDays = proposalData.validity_days || 0;
          const validityDate = new Date();
          validityDate.setDate(validityDate.getDate() + validityDays);
          const { data: userProfile } = await supabase.from('profiles').select('name, phone').eq('user_id', session.user_id).single();
          const { data: companyProfile } = await supabase.from('user_companies').select('name, email, phone, logo_url').eq('user_id', session.user_id).single();
          const { data: newProposal, error: proposalError } = await supabase.from('proposals').insert({
            title: proposalData.title,
            service_description: proposalData.summary,
            value: proposalData.total_value,
            delivery_time: proposalData.delivery_time,
            validity_date: validityDate.toISOString().split('T')[0],
            payment_terms: proposalData.payment_terms,
            status: value === 'save' ? 'rascunho' : 'enviada',
            user_id: session.user_id,
            client_id: clientId,
            user_profile: userProfile,
            company_profile: companyProfile
          }).select('id, public_hash, title').single();
          if (proposalError) throw new Error(`Erro ao criar proposta: ${proposalError.message}`);
          const budgetItemsToInsert = (proposalData.budget_items || []).map((item) => ({
            proposal_id: newProposal.id,
            type: item.type,
            description: item.description,
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0
          }));
          if (budgetItemsToInsert.length > 0) {
            const { error: itemsError } = await supabase.from('proposal_budget_items').insert(budgetItemsToInsert);
            if (itemsError) throw new Error(`Erro ao inserir itens: ${itemsError.message}`);
          }
          // AJUSTE: Usar o 'public_hash' para montar o link correto
          const proposalUrl = `https://www.borafecharai.com/proposta/${newProposal.public_hash}`;
          let finalMessage = `✅ Proposta salva com sucesso como <b>rascunho</b>!\n\n<a href="${proposalUrl}">Acesse sua proposta aqui.</a>`;
          if (value === 'send') {
            const emailMessage = `Olá ${clientData.name},\n\nEspero que esteja bem!\n\nSua proposta para o projeto "${newProposal.title}" está finalizada e disponível para visualização.\n\nPreparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no botão abaixo:\n\n[LINK_DA_PROPOSTA]\n\n\nFico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.\n\nAguardo seu retorno!\nAtenciosamente,\n\n${userProfile?.name || ''}\n${companyProfile?.name || ''}\n${companyProfile?.email || ''}\n${companyProfile?.phone || ''}`;
            const { error: emailError } = await supabase.functions.invoke('send-proposal-email', {
              body: {
                proposalId: newProposal.id,
                recipientEmail: clientData.email,
                recipientName: clientData.name,
                emailSubject: `Sua proposta para o projeto "${newProposal.title}" está pronta!`,
                emailMessage: emailMessage
              }
            });
            if (emailError) throw new Error(`Erro ao invocar função de email: ${emailError.message}`);
            finalMessage = `🚀 Proposta <b>enviada</b> com sucesso para ${clientData.email}!\n\n<a href="${proposalUrl}">Acesse sua proposta aqui.</a>`;
          }
          await sendTelegramMessage(chatId, finalMessage);
          await supabase.from('telegram_sessions').update({
            step: 'authenticated',
            session_data: {
              email: session.session_data.email
            }
          }).eq('id', session.id);
        }
      } catch (error) {
        console.error('!!! ERRO DENTRO DO PROCESSAMENTO DO CALLBACK QUERY !!!', error);
        await sendTelegramMessage(chatId, `❌ Ops! Ocorreu um erro ao processar sua escolha.\n\n<i>Detalhe: ${error.message}</i>`);
      }
      return new Response('OK');
    }
    if (update.message) {
      const { chat, from, text, audio, voice } = update.message;
      const chatId = chat.id;
      const telegramUserId = from.id;
      let { data: session } = await supabase.from('telegram_sessions').select('*').eq('chat_id', chatId).eq('telegram_user_id', telegramUserId).maybeSingle();
      const sessionExpired = session && new Date(session.expires_at) < new Date();
      if (text === '/start') {
        if (session && !sessionExpired && session.user_id) {
          const { data: currentProfile } = await supabase.from('profiles').select('name').eq('user_id', session.user_id).single();
          const currentUserName = currentProfile?.name || from.first_name;
          await sendTelegramMessage(chatId, `Olá de volta, ${currentUserName}! O que deseja fazer?`, {
            inline_keyboard: [
              [
                {
                  text: '➕ Criar Nova Proposta',
                  callback_data: 'main_choice:create_proposal'
                }
              ],
              [
                {
                  text: '📄 Ver Últimas Propostas',
                  callback_data: 'main_choice:view_proposals'
                }
              ]
            ]
          });
        } else {
          await supabase.from('telegram_sessions').upsert({
            chat_id: chatId,
            telegram_user_id: telegramUserId,
            step: 'awaiting_email',
            session_data: {},
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }, {
            onConflict: 'chat_id, telegram_user_id'
          });
          await sendTelegramMessage(chatId, `Olá ${from.first_name}! 👋\n\nPara começar, por favor, me informe seu e-mail de cadastro:`);
        }
        return new Response('OK');
      }
      if (!session || sessionExpired) {
        await sendTelegramMessage(chatId, 'Sua sessão expirou ou não foi encontrada. Por favor, digite /start para começar.');
        return new Response('OK');
      }
      switch (session.step) {
        case 'awaiting_email':
          const email = text?.toLowerCase().trim();
          if (!email || !email.includes('@')) {
            await sendTelegramMessage(chatId, '❌ Email inválido.');
            break;
          }
          const { data: subscriber, error } = await supabase.from('subscribers').select('user_id').eq('email', email).maybeSingle();
          if (error || !subscriber) {
            await sendTelegramMessage(chatId, `❌ Usuário não encontrado.\n\nParece que este e-mail ainda não está cadastrado. Por favor, crie sua conta em nossa plataforma e tente novamente!\n\n🔗 Cadastre-se aqui: https://borafecharai.com/login`);
            break;
          }
          let userName = from.first_name;
          const { data: profile } = await supabase.from('profiles').select('name').eq('user_id', subscriber.user_id).single();
          if (profile?.name) {
            userName = profile.name;
          }
          await supabase.from('telegram_sessions').update({
            user_id: subscriber.user_id,
            step: 'authenticated',
            session_data: {
              email
            }
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, `✅ <b>Bem-vindo(a) de volta, ${userName}!</b>`, {
            inline_keyboard: [
              [
                {
                  text: '➕ Criar Nova Proposta',
                  callback_data: 'main_choice:create_proposal'
                }
              ],
              [
                {
                  text: '📄 Ver Últimas Propostas',
                  callback_data: 'main_choice:view_proposals'
                }
              ]
            ]
          });
          break;
        case 'awaiting_proposal_title':
          session.session_data.proposal.title = text;
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_client_info',
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Ótimo! Agora, informe os dados do cliente:\n\n<code>Nome Completo, email, telefone</code>');
          break;
        case 'awaiting_client_info':
          const clientInfo = text.split(',').map((item) => item.trim());
          if (clientInfo.length < 2) {
            await sendTelegramMessage(chatId, '❌ Formato inválido. Envie pelo menos <b>Nome</b> e <b>E-mail</b>.');
            break;
          }
          const [clientName, clientEmail, clientPhone] = clientInfo;
          const rawPhone = clientPhone ? clientPhone.replace(/\D/g, '') : '';
          const phoneToSearch = rawPhone ? `+55${rawPhone}` : null;
          const { data: existingClient, error: searchError } = await supabase.from('clients').select('*').eq('user_id', session.user_id).or(`email.eq.${clientEmail}${phoneToSearch ? `,phone.eq.${phoneToSearch}` : ''}`).maybeSingle();
          if (searchError) {
            throw new Error("Erro ao buscar cliente.");
          }
          if (existingClient) {
            session.session_data.found_client = existingClient;
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_client_confirmation',
              session_data: session.session_data
            }).eq('id', session.id);
            let foundMessage = `🔎 Encontrei um cliente com estes dados:\n\n`;
            foundMessage += `<b>Nome:</b> ${existingClient.name}\n`;
            foundMessage += `<b>E-mail:</b> ${existingClient.email}\n`;
            if (existingClient.phone) foundMessage += `<b>Telefone:</b> ${existingClient.phone}\n`;
            foundMessage += `\nÉ este o cliente correto?`;
            await sendTelegramMessage(chatId, foundMessage, {
              inline_keyboard: [
                [
                  {
                    text: '✅ Sim, é este',
                    callback_data: 'confirm_client:yes'
                  }
                ],
                [
                  {
                    text: '❌ Não, digitar novamente',
                    callback_data: 'confirm_client:no'
                  }
                ]
              ]
            });
          } else {
            session.session_data.proposal.new_client = {
              name: clientName,
              email: clientEmail,
              phone: phoneToSearch
            };
            session.session_data.proposal.client_name = clientName;
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_proposal_method',
              session_data: session.session_data
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, `Cliente "${clientName}" não encontrado. Ele será cadastrado automaticamente. 👍\n\nComo você prefere detalhar a proposta?`, {
              inline_keyboard: [
                [
                  {
                    text: '🎙️ Enviar um Áudio',
                    callback_data: 'proposal_method:audio'
                  }
                ],
                [
                  {
                    text: '✍️ Digitar passo a passo',
                    callback_data: 'proposal_method:text'
                  }
                ]
              ]
            });
          }
          break;
        case 'awaiting_proposal_audio':
          const audioFile = audio || voice;
          if (!audioFile) {
            await sendTelegramMessage(chatId, 'Por favor, envie um arquivo de áudio ou grave uma mensagem de voz.');
            break;
          }
          await sendTelegramMessage(chatId, 'Obrigado! Recebi seu áudio. 🤖 Analisando e transcrevendo... Isso pode levar um momento.');
          try {
            const transcribedText = await transcribeAudio(audioFile.file_id);
            await sendTelegramMessage(chatId, `<b>Transcrição:</b>\n<i>"${transcribedText}"</i>\n\nAgora, estou extraindo os dados...`);
            const extractedData = await extractProposalDetails(transcribedText);
            session.session_data.proposal = {
              ...session.session_data.proposal,
              ...extractedData,
              budget_items: extractedData.budget_items || []
            };
            await showAiSummaryAndAskForEdit(session, chatId);
          } catch (error) {
            console.error("Erro no processo de IA:", error);
            await sendTelegramMessage(chatId, `❌ Desculpe, ocorreu um erro: ${error.message}.\nVamos tentar pelo método tradicional.`);
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_service_summary'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Por favor, digite um <b>resumo do que será feito</b> (escopo):');
          }
          break;
        case 'awaiting_new_scope_value':
          session.session_data.proposal.summary = text;
          await showAiSummaryAndAskForEdit(session, chatId);
          break;
        case 'awaiting_new_delivery_time_value':
          session.session_data.proposal.delivery_time = text;
          await showAiSummaryAndAskForEdit(session, chatId);
          break;
        case 'awaiting_new_validity_days_value':
          session.session_data.proposal.validity_days = parseInt(text, 10) || session.session_data.proposal.validity_days;
          await showAiSummaryAndAskForEdit(session, chatId);
          break;
        case 'awaiting_new_payment_terms_value':
          session.session_data.proposal.payment_terms = text;
          await showAiSummaryAndAskForEdit(session, chatId);
          break;
        case 'awaiting_service_summary':
          session.session_data.proposal.summary = text;
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_delivery_time',
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Entendido. Qual o <b>prazo de entrega</b>? (ex: 15 dias úteis)');
          break;
        case 'awaiting_delivery_time':
          session.session_data.proposal.delivery_time = text;
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_proposal_validity',
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Ok. E qual a <b>validade da proposta</b> em dias? (ex: 10)');
          break;
        case 'awaiting_proposal_validity':
          const days = parseInt(text, 10);
          if (isNaN(days)) {
            await sendTelegramMessage(chatId, '❌ Por favor, envie apenas o número de dias.');
            break;
          }
          session.session_data.proposal.validity_days = days;
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_payment_method',
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Anotado. Quais as <b>formas de pagamento</b>?');
          break;
        case 'awaiting_payment_method':
          session.session_data.proposal.payment_terms = text;
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_budget_method',
            session_data: session.session_data
          }).eq('id', session.id);
          const { data: templates, count } = await supabase.from('budget_templates').select('id, name', {
            count: 'exact'
          }).eq('user_id', session.user_id).limit(15);
          if (templates && templates.length > 0) {
            let message = `Você tem <b>${count} de 15</b> Modelos de Orçamento salvos. Escolha um para carregar ou adicione os itens manualmente.`;
            const buttons = templates.map((t) => {
              const buttonText = t.name.length > 40 ? t.name.substring(0, 37) + '...' : t.name;
              return [
                {
                  text: buttonText,
                  callback_data: `use_template:${t.id}`
                }
              ];
            });
            const keyboard = [
              ...buttons,
              [
                {
                  text: '➕ Adicionar itens manualmente',
                  callback_data: 'use_template:none'
                }
              ]
            ];
            await sendTelegramMessage(chatId, message, {
              inline_keyboard: keyboard
            });
          } else {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_budget_item'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Você ainda não tem Modelos de Orçamento. Vamos adicionar os itens manualmente.\n\nEnvie um ou mais itens separados por ponto e vírgula (<b>;</b>).\n\n<u>Formato por item:</u>\n<code>Tipo, Descrição, Quantidade, Valor (ex: 25.50)</code>\n\n<b>IMPORTANTE:</b> O "Tipo" deve ser <b>Material</b> ou <b>Serviço</b>.');
          }
          break;
        case 'awaiting_budget_item':
          const itemStrings = text.split(';');
          const addedItems = [];
          const errors = [];
          for (const itemString of itemStrings) {
            if (itemString.trim() === '') continue;
            const parts = itemString.split(',').map((p) => p.trim());
            if (parts.length !== 4) {
              errors.push(`Formato inválido: "${itemString}"`);
              continue;
            }
            const [typeInput, description, quantityStr, unitPriceStr] = parts;
            let dbType = '';
            const normalizedType = typeInput.toLowerCase().replace(/ /g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (normalizedType.startsWith('material')) {
              dbType = 'material';
            } else if (normalizedType.startsWith('servico')) {
              dbType = 'labor';
            } else {
              errors.push(`Tipo inválido no item "${description}" (use Material ou Serviço)`);
              continue;
            }
            const quantity = parseInt(quantityStr, 10);
            const unit_price = parseFloat(unitPriceStr.replace(',', '.'));
            if (isNaN(quantity) || isNaN(unit_price)) {
              errors.push(`Valor/Qtd inválido no item "${description}"`);
              continue;
            }
            addedItems.push({
              type: dbType,
              description,
              quantity,
              unit_price
            });
          }
          if (errors.length > 0) {
            const errorMessage = `❌ Foram encontrados erros:\n- ${errors.join('\n- ')}\n\nPor favor, corrija e envie a lista de itens completa novamente.`;
            await sendTelegramMessage(chatId, errorMessage);
            break;
          }
          session.session_data.proposal.budget_items.push(...addedItems);
          if (session.session_data.editing_ia) {
            delete session.session_data.editing_ia;
            await showAiSummaryAndAskForEdit(session, chatId);
          } else {
            await supabase.from('telegram_sessions').update({
              session_data: session.session_data,
              step: 'awaiting_save_template_choice'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, `✅ ${addedItems.length} ite${addedItems.length > 1 ? 'ns' : 'm'} adicionado${addedItems.length > 1 ? 's' : ''} com sucesso!`);
            await sendTelegramMessage(chatId, 'Gostaria de salvar este grupo de itens como um novo Modelo de Orçamento para usar no futuro?', {
              inline_keyboard: [
                [
                  {
                    text: '👍 Sim, salvar',
                    callback_data: 'save_template:yes'
                  }
                ],
                [
                  {
                    text: '👎 Não, ir para o resumo',
                    callback_data: 'save_template:no'
                  }
                ]
              ]
            });
          }
          break;
        case 'awaiting_template_item_details':
          const proposalData = session.session_data.proposal;
          const index = proposalData.current_item_index;
          const currentItem = proposalData.template_items[index];
          const details = text.split(',').map((p) => p.trim());
          if (details.length !== 2) {
            await sendTelegramMessage(chatId, '❌ Formato inválido. Envie <code>Quantidade, Valor (ex: 25.50)</code>');
            break;
          }
          const qty = parseInt(details[0], 10);
          const price = parseFloat(details[1].replace(',', '.'));
          if (isNaN(qty) || isNaN(price)) {
            await sendTelegramMessage(chatId, '❌ Quantidade ou valor inválido.');
            break;
          }
          proposalData.budget_items.push({
            type: currentItem.type,
            description: currentItem.description,
            quantity: qty,
            unit_price: price
          });
          const nextIndex = index + 1;
          if (nextIndex < proposalData.template_items.length) {
            proposalData.current_item_index = nextIndex;
            await supabase.from('telegram_sessions').update({
              session_data: session.session_data
            }).eq('id', session.id);
            const nextItem = proposalData.template_items[nextIndex];
            await sendTelegramMessage(chatId, `Item ${nextIndex + 1} de ${proposalData.template_items.length}: <b>${nextItem.description}</b>\n\nEnvie a <b>Quantidade</b> e o <b>Valor Unitário</b>:`);
          } else {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_save_template_choice'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Todos os itens do modelo foram preenchidos! Gostaria de salvar este orçamento como um novo Modelo para uso futuro?', {
              inline_keyboard: [
                [
                  {
                    text: '👍 Sim, salvar',
                    callback_data: 'save_template:yes'
                  }
                ],
                [
                  {
                    text: '👎 Não, ir para o resumo',
                    callback_data: 'save_template:no'
                  }
                ]
              ]
            });
          }
          break;
        case 'awaiting_template_name':
          const templateName = text;
          const { data: newTemplate, error: templateError } = await supabase.from('budget_templates').insert({
            name: templateName,
            user_id: session.user_id
          }).select().single();
          if (templateError) throw new Error('Erro ao salvar o modelo.');
          const itemsToSave = session.session_data.proposal.budget_items.map((item) => ({
            template_id: newTemplate.id,
            user_id: session.user_id,
            type: item.type,
            description: item.description
          }));
          await supabase.from('budget_template_items').insert(itemsToSave);
          await sendTelegramMessage(chatId, `✅ Modelo "${templateName}" salvo com sucesso!`);
          await showProposalSummary(session, chatId);
          break;
        default:
          await sendTelegramMessage(chatId, 'Não entendi. Se travou, digite /start para recomeçar.');
          break;
      }
    }
    return new Response('OK');
  } catch (error) {
    console.error('Erro geral no webhook:', error);
    return new Response('Internal Server Error', {
      status: 500
    });
  }
});
