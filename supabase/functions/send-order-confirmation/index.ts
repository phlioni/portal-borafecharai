import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    const emailResponse = await resend.emails.send({
      from: "Agendamento Confirmado <onboarding@resend.dev>",
      to: [clientEmailAddress],
      subject: "✅ Seu agendamento foi confirmado!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Agendamento Confirmado!</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 18px; color: #334155; margin-bottom: 24px;">
              Olá, <strong>${order.clients?.name || 'Cliente'}</strong>!
            </p>
            
            <p style="color: #64748b; margin-bottom: 24px;">
              Temos uma ótima notícia! <strong>${providerName}</strong> confirmou seu agendamento. 
              Aqui estão os detalhes:
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e293b; margin-top: 0;">📅 Detalhes do Agendamento</h3>
              
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="color: #64748b; width: 80px;">Data:</span>
                <strong style="color: #1e293b;">${formatDate(scheduledDate)}</strong>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="color: #64748b; width: 80px;">Horário:</span>
                <strong style="color: #1e293b;">${formatTime(scheduledTime)}</strong>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #64748b; width: 80px;">Status:</span>
                <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                  ✅ Confirmado
                </span>
              </div>
            </div>
            
            ${order.client_notes ? `
              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 20px;">
                <h4 style="color: #92400e; margin-top: 0;">📝 Suas observações:</h4>
                <p style="color: #92400e; margin-bottom: 0;">"${order.client_notes}"</p>
              </div>
            ` : ''}
            
            <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin-top: 24px;">
              <h4 style="color: #0277bd; margin-top: 0;">ℹ️ Próximos passos</h4>
              <ul style="color: #0277bd; margin-bottom: 0; padding-left: 20px;">
                <li>Mantenha este email como comprovante</li>
                <li>Certifique-se de estar disponível no horário marcado</li>
                <li>Em caso de dúvidas, entre em contato conosco</li>
              </ul>
            </div>
            
            <p style="color: #64748b; margin-top: 24px; margin-bottom: 0; text-align: center;">
              Agradecemos pela sua confiança! 🙏
            </p>
          </div>
        </div>
      `,
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