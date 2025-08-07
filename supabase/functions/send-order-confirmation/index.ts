import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  clientEmail?: string;
  providerName: string;
  scheduledDate: string;
  scheduledTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, clientEmail, providerName, scheduledDate, scheduledTime }: OrderConfirmationRequest = await req.json();

    console.log('Enviando confirmação de agendamento:', { orderId, clientEmail, providerName, scheduledDate, scheduledTime });

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração do Supabase não encontrada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados do agendamento
    const { data: order, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        clients (name, email, phone)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Erro ao buscar agendamento:', error);
      throw new Error('Agendamento não encontrado');
    }

    const clientEmailAddress = clientEmail || order.clients?.email;
    
    if (!clientEmailAddress) {
      console.log('Email do cliente não encontrado, pulando envio de email');
      return new Response(JSON.stringify({ message: 'Email não enviado - endereço não encontrado' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (time: string) => {
      return time.substring(0, 5); // HH:MM
    };

    // Buscar proposta para incluir link de reagendamento
    const { data: proposalData } = await supabase
      .from('proposals')
      .select('public_hash')
      .eq('id', order.proposal_id)
      .single();

    const proposalUrl = proposalData?.public_hash 
      ? `https://www.borafecharai.com/proposta/${proposalData.public_hash}`
      : null;

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>✅ Seu agendamento foi confirmado!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
              🎉 Agendamento Confirmado!
            </h1>
          </div>
          <div style="padding: 40px;">
            <p style="margin: 0 0 24px 0; line-height: 1.6; color: #374151; font-size: 18px;">
              Olá, <strong>${order.clients?.name || 'Cliente'}</strong>!
            </p>
            
            <p style="margin: 0 0 32px 0; line-height: 1.6; color: #64748b; font-size: 16px;">
              Temos uma ótima notícia! <strong>${providerName}</strong> confirmou seu agendamento. 
              Aqui estão os detalhes:
            </p>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 24px; border-left: 4px solid #10b981; margin-bottom: 32px;">
              <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">📅 Detalhes do Agendamento</h3>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 14px; display: inline-block; width: 80px;">Data:</span>
                <strong style="color: #1e293b; font-size: 16px;">${formatDate(scheduledDate)}</strong>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 14px; display: inline-block; width: 80px;">Horário:</span>
                <strong style="color: #1e293b; font-size: 16px;">${formatTime(scheduledTime)}</strong>
              </div>
              
              <div>
                <span style="color: #64748b; font-size: 14px; display: inline-block; width: 80px;">Status:</span>
                <span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                  ✅ Confirmado
                </span>
              </div>
            </div>
            
            ${order.client_notes ? `
              <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <h4 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">📝 Suas observações:</h4>
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">"${order.client_notes}"</p>
              </div>
            ` : ''}
            
            ${proposalUrl ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${proposalUrl}" 
                   style="display: inline-block; 
                          background-color: #3b82f6; 
                          color: #ffffff; 
                          padding: 16px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          font-size: 16px; 
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                          transition: background-color 0.2s ease;">
                  📋 Ver Proposta e Reagendar
                </a>
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 14px;">
                  Precisa reagendar? Use o link acima para acessar sua proposta
                </p>
              </div>
            ` : ''}
            
            <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 32px 0;">
              <h4 style="color: #0277bd; margin: 0 0 12px 0; font-size: 16px;">ℹ️ Próximos passos</h4>
              <ul style="color: #0277bd; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li>Mantenha este email como comprovante</li>
                <li>Certifique-se de estar disponível no horário marcado</li>
                <li>Em caso de dúvidas, entre em contato conosco</li>
              </ul>
            </div>
            
            <!-- Footer BoraFecharAI -->
            <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 40px;">
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; font-weight: 500;">
                ✨ Este agendamento foi criado com
              </p>
              <a href="https://www.borafecharai.com" 
                 target="_blank" 
                 style="display: inline-block; 
                        color: #2563eb; 
                        text-decoration: none; 
                        font-size: 20px; 
                        font-weight: 700; 
                        padding: 12px 20px; 
                        border-radius: 8px; 
                        background: rgba(37, 99, 235, 0.1); 
                        transition: all 0.2s ease;
                        border: 2px solid rgba(37, 99, 235, 0.2);">
                🚀 BoraFecharAI
              </a>
              <p style="margin: 16px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                A plataforma que transforma suas propostas em fechamentos
              </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Esta é uma mensagem automática. Não responda a este email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'BoraFecharAI - Agendamento <contato@borafecharai.com>',
        to: [clientEmailAddress],
        subject: "✅ Seu agendamento foi confirmado!",
        html: emailHTML
      })
    });

    console.log("Email de confirmação enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de confirmação enviado com sucesso',
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de confirmação:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);