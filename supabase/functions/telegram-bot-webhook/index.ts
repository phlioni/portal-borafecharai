
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
async function checkUserPermissions(userId) {
  return {
    canCreate: true
  };
}
// --- SERVIDOR PRINCIPAL DO WEBHOOK ---
serve(async (req)=>{
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
              for (const p of proposals){
                // --- LÓGICA DE STATUS E ÍCONE FINAL ---
                const statusMap = {
                  rascunho: 'Rascunho',
                  enviada: 'Enviada',
                  visualizada: 'Visualizada',
                  aceita: 'Aceita',
                  rejeitada: 'Rejeitada'
                };
                const statusText = statusMap[p.status] || p.status.charAt(0).toUpperCase() + p.status.slice(1);
                let statusEmoji = ''; // Ícone começa vazio
                if (p.status === 'rascunho') {
                  statusEmoji = '📝 ';
                } else if (p.status === 'enviada') {
                  statusEmoji = '📧 '; // Novo ícone para e-mail
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
        if (action === 'add_more_items') {
          if (value === 'yes') {
            await supabase.from('telegram_sessions').update({
              step: 'awaiting_budget_item'
            }).eq('id', session.id);
            await sendTelegramMessage(chatId, 'Ok, vamos adicionar outro item. Envie no formato:\n\n<code>Tipo, Descrição, Quantidade, Valor Unitário</code>\n\n(Lembre-se: Tipo deve ser <b>Material</b> ou <b>Mão de Obra</b>)');
          } else {
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
            proposalData.budget_items.forEach((item)=>{
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
          const { data: newProposal, error: proposalError } = await supabase.from('proposals').insert({
            title: proposalData.title,
            service_description: proposalData.summary,
            value: proposalData.total_value,
            delivery_time: proposalData.delivery_time,
            validity_date: validityDate.toISOString().split('T')[0],
            payment_terms: proposalData.payment_terms,
            status: value === 'save' ? 'rascunho' : 'enviada',
            user_id: session.user_id,
            client_id: clientId
          }).select().single();
          if (proposalError) throw new Error(`Erro ao criar proposta: ${proposalError.message}`);
          const budgetItemsToInsert = proposalData.budget_items.map((item)=>({
              ...item,
              proposal_id: newProposal.id
            }));
          const { error: itemsError } = await supabase.from('proposal_budget_items').insert(budgetItemsToInsert);
          if (itemsError) throw new Error(`Erro ao inserir itens: ${itemsError.message}`);
          const proposalUrl = `https://www.borafecharai.com/propostas/${newProposal.id}/visualizar`;
          let finalMessage = `✅ Proposta salva com sucesso como <b>rascunho</b>!\n\n<a href="${proposalUrl}">Acesse sua proposta aqui.</a>`;
          if (value === 'send') {
            let publicHash = newProposal.public_hash;
            if (!publicHash || publicHash.length < 16) {
              publicHash = btoa(`${newProposal.id}-${Date.now()}-${Math.random()}`).replace(/[+=\/]/g, '').substring(0, 32);
              await supabase.from('proposals').update({
                public_hash: publicHash
              }).eq('id', newProposal.id);
            }
            const publicUrl = `https://www.borafecharai.com/proposta/${publicHash}`;
            const { data: senderProfile } = await supabase.from('profiles').select('name').eq('user_id', session.user_id).single();
            const { data: companyProfile } = await supabase.from('user_companies').select('name, email, phone').eq('user_id', session.user_id).single();
            const emailMessageHtml = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                      <p style="margin-bottom: 8px;">Olá ${clientData.name},</p>
                      <p style="margin-top: 8px; margin-bottom: 8px;">Espero que esteja bem!</p>
                      <p style="margin-top: 8px; margin-bottom: 8px;">Sua proposta para o projeto "<strong>${newProposal.title}</strong>" está finalizada e disponível para visualização.</p>
                      <p style="margin-top: 8px; margin-bottom: 8px;">Preparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no botão abaixo:</p>
                      <div style="text-align: center; margin: 24px 0;">
                        <a href="${publicUrl}" target="_blank" style="background-color: #2563eb; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-weight: bold;">
                          📄 Visualizar Proposta
                        </a>
                      </div>
                      <p style="margin-top: 8px; margin-bottom: 8px;">Fico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.</p>
                      <p style="margin-top: 8px; margin-bottom: 8px;">Aguardo seu retorno!<br>Atenciosamente,</p>
                      <br>
                      <p style="line-height: 1.4;">
                        <strong>${senderProfile?.name || ''}</strong><br>
                        ${companyProfile?.name || ''}<br>
                        📧 ${companyProfile?.email || ''}<br>
                        📱 ${companyProfile?.phone || ''}
                      </p>
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                      <div style="font-size: 0.8em; color: #6b7280; text-align: center;">
                        <p style="margin: 4px 0;">✨ Esta proposta foi criada com</p>
                        <p style="margin: 4px 0;"><strong>🚀 BoraFecharAI</strong></p>
                        <p style="margin: 4px 0;">A plataforma que transforma suas propostas em fechamentos</p>
                        <p style="margin-top: 16px;"><small>Esta é uma mensagem automática. Não responda a este email.</small></p>
                      </div>
                    </div>
                  `;
            const { error: emailError } = await supabase.functions.invoke('send-proposal-email', {
              body: {
                proposalId: newProposal.id,
                recipientEmail: clientData.email,
                recipientName: clientData.name,
                emailSubject: `Sua proposta para o projeto "${newProposal.title}" está pronta!`,
                emailMessage: emailMessageHtml,
                publicUrl: publicUrl
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
      switch(session.step){
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
          const clientInfo = text.split(',').map((item)=>item.trim());
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
            step: 'awaiting_budget_item',
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Para finalizar, adicione os itens do orçamento no formato:\n\n<code>Tipo, Descrição, Quantidade, Valor Unitário</code>\n\n<b>IMPORTANTE:</b> O "Tipo" deve ser <b>Material</b> ou <b>Mão de Obra</b>.');
          break;
        case 'awaiting_budget_item':
          const parts = text.split(',').map((p)=>p.trim());
          if (parts.length !== 4) {
            await sendTelegramMessage(chatId, '❌ Formato inválido. Tente novamente: <code>Tipo, Descrição, Qtd, Valor</code>');
            break;
          }
          const [typeInput, description, quantityStr, unitPriceStr] = parts;
          let dbType = '';
          const normalizedType = typeInput.toLowerCase().replace(/ /g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (normalizedType.startsWith('material')) {
            dbType = 'material';
          } else if (normalizedType.startsWith('maodeobra')) {
            dbType = 'labor';
          } else {
            await sendTelegramMessage(chatId, '❌ Tipo inválido. Por favor, use <b>Material</b> ou <b>Mão de Obra</b> como o primeiro item.');
            break;
          }
          const quantity = parseInt(quantityStr, 10);
          const unit_price = parseFloat(unitPriceStr.replace(',', '.'));
          if (isNaN(quantity) || isNaN(unit_price)) {
            await sendTelegramMessage(chatId, '❌ Quantidade ou valor inválido. Tente novamente.');
            break;
          }
          session.session_data.proposal.budget_items.push({
            type: dbType,
            description,
            quantity,
            unit_price
          });
          await supabase.from('telegram_sessions').update({
            session_data: session.session_data
          }).eq('id', session.id);
          await sendTelegramMessage(chatId, 'Item adicionado! Deseja adicionar outro item?', {
            inline_keyboard: [
              [
                {
                  text: '👍 Sim',
                  callback_data: 'add_more_items:yes'
                }
              ],
              [
                {
                  text: '✅ Não, ir para o resumo',
                  callback_data: 'add_more_items:no'
                }
              ]
            ]
          });
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
