import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!botToken) {
      return new Response(JSON.stringify({ 
        error: 'TELEGRAM_BOT_TOKEN não configurado' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-bot-webhook`;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

    console.log('Configurando webhook:', webhookUrl);

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
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook configurado com sucesso!',
        webhook_url: webhookUrl,
        telegram_response: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        error: 'Erro ao configurar webhook', 
        details: result 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});