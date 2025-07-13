
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
  proposalId: string;
  recipientEmail: string;
  recipientName: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalId, recipientEmail, recipientName }: EmailRequest = await req.json();

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    // Buscar dados da proposta
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        companies (
          name,
          email,
          phone
        )
      `)
      .eq('id', proposalId)
      .single();

    if (error || !proposal) {
      throw new Error('Proposta não encontrada');
    }

    // Construir HTML da proposta
    const proposalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
            .value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${proposal.title}</h1>
              ${proposal.service_description ? `<p style="font-size: 18px; color: #666;">${proposal.service_description}</p>` : ''}
            </div>

            ${proposal.companies ? `
            <div class="section">
              <h2>Informações do Cliente</h2>
              <p><strong>Cliente:</strong> ${proposal.companies.name}</p>
              ${proposal.companies.email ? `<p><strong>Email:</strong> ${proposal.companies.email}</p>` : ''}
              ${proposal.companies.phone ? `<p><strong>Telefone:</strong> ${proposal.companies.phone}</p>` : ''}
            </div>
            ` : ''}

            ${proposal.detailed_description ? `
            <div class="section">
              <h2>Descrição do Serviço</h2>
              <p>${proposal.detailed_description.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div class="section">
              <h2>Informações Financeiras</h2>
              ${proposal.value ? `<p><strong>Valor Total:</strong> <span class="value">R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>` : ''}
              ${proposal.delivery_time ? `<p><strong>Prazo de Entrega:</strong> ${proposal.delivery_time}</p>` : ''}
              ${proposal.validity_date ? `<p><strong>Válida até:</strong> ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>

            ${proposal.observations ? `
            <div class="section">
              <h2>Observações</h2>
              <p>${proposal.observations.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p>Esta proposta foi gerada automaticamente pelo sistema</p>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Propostas <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `Proposta: ${proposal.title}`,
        html: proposalHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Erro ao enviar email: ${errorData}`);
    }

    const emailResult = await emailResponse.json();

    // Atualizar status da proposta para enviada
    await supabase
      .from('proposals')
      .update({ 
        status: 'enviada',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId);

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResult.id,
      message: 'Proposta enviada com sucesso!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-proposal-email function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
