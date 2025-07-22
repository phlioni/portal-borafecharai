import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// --- CONFIGURAÇÃO INICIAL ---
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
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
// Função auxiliar para mostrar o resumo e evitar repetição de código
async function showProposalSummary(session, chatId) {
  await supabase.from('telegram_sessions').update({
    step: 'awaiting_proposal_confirmation'
  }).eq('id', session.id);
  const proposalData = session.session_data.proposal;
  let summary = `📝 <b>Resumo da Proposta</b> 📝\n\n`;
  summary += `<b>Título:</b> ${proposalData.title}\n`;
  summary += `<b>Cliente:</b> ${proposalData.new_client?.name || 'Cliente Existente'}\n`;
  summary += `<b>Resumo:</b> ${proposalData.summary}\n`;
  summary += `<b>Prazo:</b> ${proposalData.delivery_time}\n`;
  summary += `<b>Validade:</b> ${proposalData.validity_days} dias\n`;
  summary += `<b>Pagamento:</b> ${proposalData.payment_terms}\n\n`;
  summary += `<b>Itens do Orçamento:</b>\n`;
  let totalValue = 0;
  proposalData.budget_items.forEach((item) => {
    const itemTotal = item.quantity * item.unit_price;
    totalValue += itemTotal;
    summary += `  - [${item.type}] ${item.description} (${item.quantity}x R$ ${item.unit_price.toFixed(2)}) = R$ ${itemTotal.toFixed(2)}\n`;
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
            const { data: proposals, error } = await supabase.from('proposals').select(`id, title, value, status, client:clients (name)`).eq('user_id', session.user_id).order('created_at', {
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
                proposalList += `<a href="https://www.borafecharai.com/propostas/${p.id}/visualizar">Ver Proposta</a>\n\n`;
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
            await sendTelegramMessage(chatId, 'Ok, vamos começar do zero. Envie um ou mais itens separados por ponto e vírgula (<b>;</b>).\n\n<u>Formato por item:</u>\n<code>Tipo, Descrição, Quantidade, Valor (ex: 25.50)</code>');
          } else {
            const templateId = value;
            const { data: template } = await supabase.from('budget_templates').select('name, items:budget_template_items(type, description)').eq('id', templateId).single();
            if (!template || !template.items || template.items.length === 0) {
              await sendTelegramMessage(chatId, '❌ Não foi possível carregar os itens deste modelo. Vamos começar do zero.');
              await supabase.from('telegram_sessions').update({
                step: 'awaiting_budget_item'
              }).eq('id', session.id);
              await sendTelegramMessage(chatId, 'Envie o primeiro item no formato:\n\n<code>Tipo, Descrição, Quantidade, Valor (ex: 25.50)</code>');
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
          const budgetItemsToInsert = proposalData.budget_items.map((item) => ({
            ...item,
            proposal_id: newProposal.id
          }));
          const { error: itemsError } = await supabase.from('proposal_budget_items').insert(budgetItemsToInsert);
          if (itemsError) throw new Error(`Erro ao inserir itens: ${itemsError.message}`);
          const proposalUrl = `https://www.borafecharai.com/propostas/${newProposal.id}/visualizar`;
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
      const { chat, from, text } = update.message;
      const chatId = chat.id;
      const telegramUserId = from.id;
      let { data: session } = await supabase.from('telegram_sessions').select('*').eq('chat_id', chatId).eq('telegram_user_id', telegramUserId).maybeSingle();
      if (!session) {
        return new Response('OK');
      }
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
      if (!session) {
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
            await sendTelegramMessage(chatId, '❌ Email não encontrado.');
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
            await sendTelegramMessage(chatId, '❌ Formato inválido. Envie pelo menos nome e e-mail.');
            break;
          }
          const [clientName, clientEmail, clientPhone] = clientInfo;
          const { data: existingClient } = await supabase.from('clients').select('id').eq('email', clientEmail).eq('user_id', session.user_id).maybeSingle();
          if (existingClient) {
            session.session_data.proposal.client_id = existingClient.id;
          } else {
            session.session_data.proposal.new_client = {
              name: clientName,
              email: clientEmail,
              phone: clientPhone
            };
          }
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_service_summary',
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Perfeito. Agora, um <b>resumo do que será feito</b> (escopo):');
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
            await sendTelegramMessage(chatId, 'Você ainda não tem Modelos de Orçamento. Vamos adicionar os itens manualmente.\n\nEnvie um ou mais itens separados por ponto e vírgula (<b>;</b>).\n\n<u>Formato por item:</u>\n<code>Tipo, Descrição, Quantidade, Valor (ex: 25.50)</code>');
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
            } else if (normalizedType.startsWith('maodeobra')) {
              dbType = 'labor';
            } else {
              errors.push(`Tipo inválido em "${itemString}"`);
              continue;
            }
            const quantity = parseInt(quantityStr, 10);
            const unit_price = parseFloat(unitPriceStr.replace(',', '.'));
            if (isNaN(quantity) || isNaN(unit_price)) {
              errors.push(`Quantidade ou valor inválido em "${itemString}"`);
              continue;
            }
            addedItems.push({
              type: dbType,
              description,
              quantity,
              unit_price
            });
          }
          if (addedItems.length > 0) {
            session.session_data.proposal.budget_items.push(...addedItems);
            await supabase.from('telegram_sessions').update({
              session_data: session.session_data
            }).eq('id', session.id);
          }
          let responseMessage = `${addedItems.length} ite${addedItems.length > 1 ? 'ns' : 'm'} adicionado${addedItems.length > 1 ? 's' : ''} com sucesso!`;
          if (errors.length > 0) {
            responseMessage += `\n\n<b>Erros encontrados:</b>\n- ${errors.join('\n- ')}`;
          }
          await sendTelegramMessage(chatId, responseMessage);
          await supabase.from('telegram_sessions').update({
            step: 'awaiting_save_template_choice'
          }).eq('id', session.id);
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
            await showProposalSummary(session, chatId);
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
