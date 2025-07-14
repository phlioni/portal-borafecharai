
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
          value,
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
        // Buscar configurações do bot do usuário para obter o chat_id
        const { data: botSettings } = await supabase
          .from('telegram_bot_settings')
          .select('*')
          .eq('user_id', notification.user_id)
          .single();

        if (!botSettings?.chat_id) {
          console.log(`Usuário ${notification.user_id} não tem chat_id configurado`);
          
          // Marcar como processada mesmo sem enviar
          const { error: updateError } = await supabase
            .from('proposal_notifications')
            .update({ notified: true })
            .eq('id', notification.id);

          if (updateError) {
            console.error('Erro ao marcar notificação como processada:', updateError);
          }
          continue;
        }

        const proposal = notification.proposals;
        const companyName = proposal?.companies?.name || 'Cliente';
        const proposalValue = proposal?.value ? 
          `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
          'Valor não informado';
        
        let message = '';
        if (notification.status === 'aceita') {
          message = `🎉 *Proposta Aceita!*\n\n` +
                   `📋 **${proposal?.title || 'Proposta'}**\n` +
                   `👤 Cliente: ${companyName}\n` +
                   `💰 Valor: ${proposalValue}\n\n` +
                   `✅ Parabéns! Sua proposta foi aceita pelo cliente.\n\n` +
                   `💡 Agora é hora de começar o projeto!\n\n` +
                   `🔗 Acesse o sistema para ver mais detalhes.`;
        } else if (notification.status === 'rejeitada') {
          message = `❌ *Proposta Rejeitada*\n\n` +
                   `📋 **${proposal?.title || 'Proposta'}**\n` +
                   `👤 Cliente: ${companyName}\n` +
                   `💰 Valor: ${proposalValue}\n\n` +
                   `😞 Infelizmente, sua proposta foi rejeitada pelo cliente.\n\n` +
                   `💡 Não desista! Analise o feedback e prepare uma nova proposta.\n\n` +
                   `🚀 Que tal criar uma nova proposta agora mesmo? Digite /start`;
        }

        if (message) {
          const success = await sendTelegramNotification(botSettings.chat_id.toString(), message);
          
          if (success) {
            console.log(`Notificação enviada com sucesso para usuário ${notification.user_id}`);
          } else {
            console.log(`Falha ao enviar notificação para usuário ${notification.user_id}`);
          }
        }

        // Marcar como processada independentemente do sucesso do envio
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
        
        // Marcar como processada mesmo com erro para evitar loop infinito
        const { error: updateError } = await supabase
          .from('proposal_notifications')
          .update({ notified: true })
          .eq('id', notification.id);

        if (updateError) {
          console.error('Erro ao marcar notificação como processada após erro:', updateError);
        }
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
    console.log('Processando notificações do Telegram...');
    
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
