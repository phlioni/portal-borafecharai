import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== CONFIGURANDO WEBHOOK TELEGRAM ===');
  console.log('Método:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    console.log('Bot token configurado:', !!botToken);
    console.log('Supabase URL:', supabaseUrl);
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN não configurado');
      return new Response(JSON.stringify({ 
        error: 'TELEGRAM_BOT_TOKEN não configurado',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-bot-webhook`;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

    console.log('Configurando webhook:', webhookUrl);
    console.log('URL da API do Telegram:', telegramUrl);

    // Primeiro, vamos limpar webhook anterior
    console.log('Limpando webhook anterior...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
      method: 'POST'
    });
    const deleteResult = await deleteResponse.json();
    console.log('Resultado da limpeza:', deleteResult);

    // Agora configurar o novo webhook
    console.log('Configurando novo webhook...');
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        max_connections: 40,
        allowed_updates: ['message']
      }),
    });

    const result = await response.json();
    console.log('Resposta do Telegram:', result);

    if (result.ok) {
      // Verificar informações do webhook
      const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const infoResult = await infoResponse.json();
      console.log('Informações do webhook:', infoResult);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook configurado com sucesso!',
        webhook_url: webhookUrl,
        telegram_response: result,
        webhook_info: infoResult.result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Erro ao configurar webhook:', result);
      return new Response(JSON.stringify({ 
        error: 'Erro ao configurar webhook', 
        details: result,
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erro na configuração do webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});