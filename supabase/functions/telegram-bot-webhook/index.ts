
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from: { id: number; first_name: string; username?: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
    message: {
      chat: { id: number };
      message_id: number;
    };
    from: { id: number; first_name: string; username?: string };
  };
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

async function checkUserPermissions(userId: string) {
  try {
    const { data: canCreate, error } = await supabase.rpc('can_create_proposal', {
      _user_id: userId
    });

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return { canCreate: false, error: 'Erro ao verificar permissão' };
    }

    if (!canCreate) {
      // Buscar informações sobre o limite para mostrar mensagem específica
      const { data: subscriberData } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, trial_end_date, trial_proposals_used')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: trialLimits } = await supabase
        .from('trial_limits')
        .select('trial_proposals_limit')
        .eq('user_id', userId)
        .maybeSingle();

      const isInTrial = subscriberData?.trial_end_date && new Date(subscriberData.trial_end_date) > new Date();
      const proposalsUsed = subscriberData?.trial_proposals_used || 0;
      const proposalsLimit = trialLimits?.trial_proposals_limit || 20;

      let errorMessage = '';
      if (isInTrial) {
        if (proposalsUsed >= proposalsLimit) {
          errorMessage = `❌ Limite de ${proposalsLimit} propostas do trial atingido.\n\nVocê já criou ${proposalsUsed} propostas.\n\n🚀 Faça upgrade para continuar criando propostas!`;
        } else {
          errorMessage = '❌ Trial expirado.\n\n🚀 Faça upgrade para continuar criando propostas!';
        }
      } else {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: monthlyCount } = await supabase.rpc('get_monthly_proposal_count', {
          _user_id: userId,
          _month: currentMonth
        });
        
        errorMessage = `❌ Limite de 10 propostas por mês atingido.\n\nVocê já criou ${monthlyCount || 0} propostas este mês.\n\n🚀 Faça upgrade para o plano Professional para ter propostas ilimitadas!`;
      }

      return { canCreate: false, error: errorMessage };
    }

    return { canCreate: true };
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return { canCreate: false, error: 'Erro interno ao verificar permissões' };
  }
}

serve(async (req) => {
  try {
    const update: TelegramUpdate = await req.json();
    
    if (update.message) {
      const { chat, from, text } = update.message;
      const chatId = chat.id;
      const telegramUserId = from.id;

      // Buscar sessão existente
      let { data: session } = await supabase
        .from('telegram_sessions')
        .select('*')
        .eq('chat_id', chatId)
        .eq('telegram_user_id', telegramUserId)
        .maybeSingle();

      // Se não existe sessão, criar uma nova
      if (!session) {
        const { data: newSession, error } = await supabase
          .from('telegram_sessions')
          .insert({
            chat_id: chatId,
            telegram_user_id: telegramUserId,
            step: 'start',
            session_data: {},
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar sessão:', error);
          await sendTelegramMessage(chatId, '❌ Erro interno. Tente novamente mais tarde.');
          return new Response('OK');
        }

        session = newSession;
      }

      // Verificar se a sessão expirou
      if (new Date(session.expires_at) < new Date()) {
        await supabase
          .from('telegram_sessions')
          .delete()
          .eq('id', session.id);

        await sendTelegramMessage(chatId, '⏰ Sua sessão expirou. Digite /start para começar novamente.');
        return new Response('OK');
      }

      // Processar comandos
      if (text === '/start') {
        await supabase
          .from('telegram_sessions')
          .update({
            step: 'awaiting_email',
            session_data: {},
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        await sendTelegramMessage(chatId, 
          `🤖 <b>Bem-vindo ao Bot de Propostas!</b>\n\n` +
          `Olá ${from.first_name}! 👋\n\n` +
          `Vou te ajudar a criar propostas comerciais rapidamente.\n\n` +
          `Para começar, preciso do seu email cadastrado na plataforma:`
        );
        return new Response('OK');
      }

      // Processar fluxo baseado no step atual
      if (session.step === 'awaiting_email') {
        const email = text?.toLowerCase();
        
        if (!email || !email.includes('@')) {
          await sendTelegramMessage(chatId, '❌ Por favor, digite um email válido:');
          return new Response('OK');
        }

        // Buscar usuário pelo email
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('user_id')
          .eq('email', email)
          .maybeSingle();

        if (!subscriber) {
          await sendTelegramMessage(chatId, 
            `❌ Email não encontrado na nossa base de dados.\n\n` +
            `Certifique-se de usar o mesmo email cadastrado na plataforma.`
          );
          return new Response('OK');
        }

        // Verificar permissões do usuário
        const permissions = await checkUserPermissions(subscriber.user_id);
        
        if (!permissions.canCreate) {
          await sendTelegramMessage(chatId, permissions.error || 'Você não tem permissão para criar propostas.');
          return new Response('OK');
        }

        // Atualizar sessão com user_id
        await supabase
          .from('telegram_sessions')
          .update({
            user_id: subscriber.user_id,
            step: 'authenticated',
            session_data: { email },
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        await sendTelegramMessage(chatId, 
          `✅ <b>Autenticado com sucesso!</b>\n\n` +
          `Email: ${email}\n\n` +
          `Agora você pode criar propostas! Digite o que você gostaria de propor:`
        );
        return new Response('OK');
      }

      if (session.step === 'authenticated' && session.user_id) {
        // Verificar permissões novamente antes de processar
        const permissions = await checkUserPermissions(session.user_id);
        
        if (!permissions.canCreate) {
          await sendTelegramMessage(chatId, permissions.error || 'Você não tem mais permissão para criar propostas.');
          return new Response('OK');
        }

        if (text) {
          await sendTelegramMessage(chatId, 
            `🤖 <b>Processando sua solicitação...</b>\n\n` +
            `"${text}"\n\n` +
            `⏳ Isso pode levar alguns segundos...`
          );

          try {
            // Chamar a função de chat para processar a mensagem
            const { data: chatResponse, error: chatError } = await supabase.functions.invoke('chat-proposal', {
              body: {
                messages: [{ role: 'user', content: text }],
                action: 'generate',
                user_id: session.user_id
              }
            });

            if (chatError) {
              console.error('Erro no chat:', chatError);
              
              // Se for erro de limite, mostrar mensagem específica
              if (chatError.message && chatError.message.includes('Limite de')) {
                await sendTelegramMessage(chatId, `❌ ${chatError.message}`);
                return new Response('OK');
              }
              
              await sendTelegramMessage(chatId, '❌ Erro ao processar sua solicitação. Tente novamente.');
              return new Response('OK');
            }

            const proposalData = JSON.parse(chatResponse.content);
            
            // Calcular valor total
            const totalValue = proposalData.budget_items?.reduce((total: number, item: any) => {
              return total + (item.quantity * item.unit_price);
            }, 0) || 0;

            // Criar proposta automaticamente
            const { data: newProposal, error: proposalError } = await supabase
              .from('proposals')
              .insert({
                title: proposalData.titulo || 'Proposta via Telegram',
                service_description: proposalData.servico || text,
                detailed_description: proposalData.descricao || text,
                value: totalValue > 0 ? totalValue : null,
                delivery_time: proposalData.prazo || null,
                observations: proposalData.observacoes || null,
                status: 'rascunho',
                user_id: session.user_id
              })
              .select()
              .single();

            if (proposalError) {
              console.error('Erro ao criar proposta:', proposalError);
              await sendTelegramMessage(chatId, '❌ Erro ao criar proposta. Tente novamente.');
              return new Response('OK');
            }

            // Salvar itens do orçamento se existirem
            if (proposalData.budget_items && proposalData.budget_items.length > 0) {
              const budgetItems = proposalData.budget_items.map((item: any) => ({
                proposal_id: newProposal.id,
                type: item.type,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price
              }));

              await supabase
                .from('proposal_budget_items')
                .insert(budgetItems);
            }

            const proposalUrl = `https://www.borafecharai.com/propostas/${newProposal.id}/visualizar`;
            
            await sendTelegramMessage(chatId, 
              `✅ <b>Proposta criada com sucesso!</b>\n\n` +
              `📋 <b>Título:</b> ${newProposal.title}\n` +
              `💰 <b>Valor:</b> ${totalValue > 0 ? `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A definir'}\n\n` +
              `🔗 <b>Acesse sua proposta:</b>\n${proposalUrl}\n\n` +
              `💡 <b>Dica:</b> Você pode editar e personalizar sua proposta na plataforma!`
            );

          } catch (error) {
            console.error('Erro ao processar proposta:', error);
            await sendTelegramMessage(chatId, '❌ Erro ao processar sua proposta. Tente novamente.');
          }
        }
        return new Response('OK');
      }

      // Outras mensagens quando não está no fluxo correto
      await sendTelegramMessage(chatId, 
        `🤖 Para começar, digite /start\n\n` +
        `Se você já está autenticado, digite o que gostaria de propor.`
      );
    }

    return new Response('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
