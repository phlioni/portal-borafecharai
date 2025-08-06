
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { record } = await req.json();
    console.log('New work order created:', record);

    // Get user's telegram settings
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: telegramSettings, error } = await supabase
      .from('telegram_bot_settings')
      .select('chat_id')
      .eq('user_id', record.user_id)
      .single();

    if (error || !telegramSettings?.chat_id) {
      console.log('No Telegram chat ID found for user:', record.user_id);
      return new Response(
        JSON.stringify({ message: 'No Telegram configuration found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scheduledDate = new Date(record.scheduled_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const text = `🔔 *Nova Ordem de Serviço Recebida!*\n\n` +
                `*Endereço:* ${record.address}\n` +
                `*Data:* ${scheduledDate}\n` +
                `*Status:* ${record.status}\n\n` +
                `Acesse a plataforma para aprovar o agendamento.`;
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: telegramSettings.chat_id, 
        text, 
        parse_mode: 'Markdown' 
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
      throw new Error(`Telegram API error: ${errorText}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
