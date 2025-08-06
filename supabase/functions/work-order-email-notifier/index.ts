
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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { record, old_record } = await req.json();
    
    // Only send email when status changes to 'approved'
    if (record.status !== 'approved' || old_record?.status === 'approved') {
      return new Response(
        JSON.stringify({ message: 'No email notification needed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Work order approved, sending email notification:', record);

    // Get client information
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name, email')
      .eq('id', record.client_id)
      .single();

    if (clientError || !client?.email) {
      console.log('No client email found for client:', record.client_id);
      return new Response(
        JSON.stringify({ message: 'No client email found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scheduledDate = new Date(record.scheduled_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = 'Seu agendamento foi confirmado!';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Olá, ${client.name}!</h1>
        <p>Seu agendamento para o serviço foi <strong>confirmado</strong>!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Detalhes do Agendamento:</h2>
          <p><strong>Data e Hora:</strong> ${scheduledDate}</p>
          <p><strong>Endereço:</strong> ${record.address}</p>
        </div>
        
        <p>O prestador de serviço entrará em contato com você para confirmar os detalhes finais.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Este é um email automático. Caso tenha dúvidas, entre em contato através da plataforma.
        </p>
      </div>
    `;
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Bora Fechar Aí <noreply@borafecharai.com>',
        to: [client.email],
        subject: subject,
        html: htmlBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
