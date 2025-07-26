
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

interface ServiceOrderEmailRequest {
  type: 'created' | 'confirmed' | 'reschedule_request';
  serviceOrder: {
    id: string;
    scheduled_date: string;
    scheduled_time: string;
    status: string;
    client_notes?: string;
    provider_notes?: string;
  };
  proposal: {
    title: string;
    public_hash: string;
  };
  client: {
    name: string;
    email: string;
  };
  provider: {
    name: string;
    email: string;
  };
  company: {
    name: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const emailData: ServiceOrderEmailRequest = await req.json();

    let subject = '';
    let htmlContent = '';
    let recipient = '';

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    switch (emailData.type) {
      case 'created':
        recipient = emailData.provider.email;
        subject = `Novo Agendamento - ${emailData.proposal.title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Novo Agendamento de Serviço</h2>
            <p>Olá ${emailData.provider.name},</p>
            <p>Você tem um novo agendamento de serviço:</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${emailData.proposal.title}</h3>
              <p><strong>Cliente:</strong> ${emailData.client.name}</p>
              <p><strong>Data:</strong> ${formatDate(emailData.serviceOrder.scheduled_date)}</p>
              <p><strong>Horário:</strong> ${emailData.serviceOrder.scheduled_time}</p>
              ${emailData.serviceOrder.client_notes ? `<p><strong>Observações do Cliente:</strong> ${emailData.serviceOrder.client_notes}</p>` : ''}
            </div>

            <p>Acesse sua área de ordens de serviço para gerenciar este agendamento.</p>
            
            <p>Atenciosamente,<br>${emailData.company.name}</p>
          </div>
        `;
        break;

      case 'confirmed':
        recipient = emailData.client.email;
        subject = `Agendamento Confirmado - ${emailData.proposal.title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Agendamento Confirmado</h2>
            <p>Olá ${emailData.client.name},</p>
            <p>Seu agendamento foi confirmado pelo prestador de serviço:</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3>${emailData.proposal.title}</h3>
              <p><strong>Data:</strong> ${formatDate(emailData.serviceOrder.scheduled_date)}</p>
              <p><strong>Horário:</strong> ${emailData.serviceOrder.scheduled_time}</p>
              <p><strong>Status:</strong> Confirmado ✅</p>
              ${emailData.serviceOrder.provider_notes ? `<p><strong>Observações:</strong> ${emailData.serviceOrder.provider_notes}</p>` : ''}
            </div>

            <p>Aguardamos você na data e horário marcados.</p>
            
            <p>Atenciosamente,<br>${emailData.company.name}</p>
          </div>
        `;
        break;

      case 'reschedule_request':
        recipient = emailData.client.email;
        subject = `Solicitação de Reagendamento - ${emailData.proposal.title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Solicitação de Reagendamento</h2>
            <p>Olá ${emailData.client.name},</p>
            <p>O prestador de serviço solicitou o reagendamento do seu compromisso:</p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h3>${emailData.proposal.title}</h3>
              <p><strong>Agendamento Atual:</strong></p>
              <p>Data: ${formatDate(emailData.serviceOrder.scheduled_date)}</p>
              <p>Horário: ${emailData.serviceOrder.scheduled_time}</p>
              ${emailData.serviceOrder.provider_notes ? `<p><strong>Motivo:</strong> ${emailData.serviceOrder.provider_notes}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('https://', 'https://app.')}/proposta/${emailData.proposal.public_hash}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Escolher Nova Data
              </a>
            </div>

            <p>Clique no botão acima para escolher uma nova data e horário.</p>
            
            <p>Atenciosamente,<br>${emailData.company.name}</p>
          </div>
        `;
        break;

      default:
        throw new Error('Tipo de e-mail não suportado');
    }

    const { error } = await resend.emails.send({
      from: 'Bora Fechar <noreply@borafecharai.com>',
      to: [recipient],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
