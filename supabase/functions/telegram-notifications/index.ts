
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

async function sendTelegramNotification(chatId: string, message: string) {
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN não configurado');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    const data = await response.json();
    console.log('Resposta do Telegram:', data);
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return false;
  }
}

async function processNotifications() {
  try {
    // Buscar notificações não enviadas
    const { data: notifications, error } = await supabase
      .from('proposal_notifications')
      .select(`
        *,
        proposals:proposal_id (
          id,
          title,
          companies:company_id (
            name
          )
        )
      `)
      .eq('notified', false)
      .limit(10);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return;
    }

    console.log(`Processando ${notifications?.length || 0} notificações`);

    for (const notification of notifications || []) {
      try {
        // Buscar configurações do bot do usuário
        const { data: botSettings } = await supabase
          .from('telegram_bot_settings')
          .select('*')
          .eq('user_id', notification.user_id)
          .single();

        if (!botSettings?.bot_token) {
          console.log(`Usuário ${notification.user_id} não tem bot configurado`);
          continue;
        }

        // Buscar o chat_id do usuário (seria necessário armazenar isso quando o usuário inicia o bot)
        // Por enquanto, vamos tentar enviar para o próprio usuário usando o ID do Telegram
        
        const proposal = notification.proposals;
        const companyName = proposal?.companies?.name || 'Cliente';
        
        let message = '';
        if (notification.status === 'aceita') {
          message = `🎉 *Proposta Aceita!*\n\n` +
                   `📋 **${proposal?.title || 'Proposta'}**\n` +
                   `👤 Cliente: ${companyName}\n\n` +
                   `✅ Parabéns! Sua proposta foi aceita pelo cliente.\n\n` +
                   `💡 Agora é hora de começar o projeto!`;
        } else if (notification.status === 'rejeitada') {
          message = `❌ *Proposta Rejeitada*\n\n` +
                   `📋 **${proposal?.title || 'Proposta'}**\n` +
                   `👤 Cliente: ${companyName}\n\n` +
                   `😞 Infelizmente, sua proposta foi rejeitada pelo cliente.\n\n` +
                   `💡 Não desista! Analise o feedback e prepare uma nova proposta.`;
        }

        // Aqui você precisaria ter uma forma de obter o chat_id do Telegram do usuário
        // Por exemplo, salvando quando o usuário inicia o bot pela primeira vez
        // Por enquanto, vamos marcar como processada
        
        const { error: updateError } = await supabase
          .from('proposal_notifications')
          .update({ notified: true })
          .eq('id', notification.id);

        if (updateError) {
          console.error('Erro ao marcar notificação como enviada:', updateError);
        } else {
          console.log(`Notificação ${notification.id} processada`);
        }

      } catch (error) {
        console.error('Erro ao processar notificação individual:', error);
      }
    }
  } catch (error) {
    console.error('Erro geral no processamento de notificações:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Processar notificações pendentes
    await processNotifications();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
