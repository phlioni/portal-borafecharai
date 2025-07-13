
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
  emailSubject?: string;
  emailMessage?: string;
  publicUrl?: string;
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
    console.log('Iniciando processamento de envio de email...');
    
    const body = await req.json();
    console.log('Dados recebidos:', body);
    
    const { 
      proposalId, 
      recipientEmail, 
      recipientName,
      emailSubject,
      emailMessage,
      publicUrl 
    }: EmailRequest = body;

    // Validar dados obrigatórios
    if (!proposalId || !recipientEmail || !recipientName) {
      throw new Error('Dados obrigatórios não fornecidos: proposalId, recipientEmail, recipientName');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    console.log('Conectando ao Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar dados da proposta
    console.log('Buscando proposta:', proposalId);
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

    if (error) {
      console.error('Erro ao buscar proposta:', error);
      throw new Error(`Erro ao buscar proposta: ${error.message}`);
    }

    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    console.log('Proposta encontrada:', proposal.title);

    // URL pública da proposta
    const finalPublicUrl = publicUrl || `${supabaseUrl}/proposta/${proposal.public_hash || btoa(proposalId)}`;
    console.log('URL pública final:', finalPublicUrl);

    // Template de email personalizado ou padrão
    const defaultSubject = `Proposta: ${proposal.title}`;
    const defaultMessage = `
Olá ${recipientName},

Estou enviando a proposta "${proposal.title}" para sua análise.

Esta proposta é válida por tempo limitado. Clique no link abaixo para visualizar e baixar a proposta em PDF:

${finalPublicUrl}

Detalhes da proposta:
- Valor: ${proposal.value ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A definir'}
- Prazo: ${proposal.delivery_time || 'A definir'}
${proposal.validity_date ? `- Válida até: ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}` : ''}

Fico à disposição para esclarecer qualquer dúvida.

Atenciosamente,
Equipe de Propostas
    `.trim();

    // Construir HTML da proposta para o email
    const proposalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
            }
            .content { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
            }
            .button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
            }
            .proposal-details {
              background: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${proposal.title}</h1>
            <p>Proposta Comercial</p>
          </div>

          <div class="content">
            <p>Olá <strong>${recipientName}</strong>,</p>
            
            <p>${emailMessage ? emailMessage.replace(/\n/g, '<br>') : defaultMessage.replace(/\n/g, '<br>')}</p>
            
            <div class="proposal-details">
              <h3>Resumo da Proposta</h3>
              ${proposal.service_description ? `<p><strong>Serviço:</strong> ${proposal.service_description}</p>` : ''}
              ${proposal.value ? `<p><strong>Valor:</strong> R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>` : ''}
              ${proposal.delivery_time ? `<p><strong>Prazo:</strong> ${proposal.delivery_time}</p>` : ''}
              ${proposal.validity_date ? `<p><strong>Válida até:</strong> ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>

            <div style="text-align: center;">
              <a href="${finalPublicUrl}" class="button">
                📄 Visualizar Proposta Completa
              </a>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              💡 <strong>Dica:</strong> Na página da proposta, você pode baixar o arquivo em PDF para guardar ou imprimir.
            </p>
          </div>

          <div class="footer">
            <p>Esta proposta foi gerada automaticamente pelo sistema</p>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            ${proposal.validity_date ? `<p><strong>⚠️ Atenção:</strong> Esta proposta expira em ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
          </div>
        </body>
      </html>
    `;

    console.log('Enviando email via Resend...');

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Propostas <contato@borafecharai.com>',
        to: [recipientEmail],
        subject: emailSubject || defaultSubject,
        html: proposalHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Erro do Resend:', errorData);
      throw new Error(`Erro ao enviar email: ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email enviado com sucesso:', emailResult);

    // Atualizar status da proposta para enviada
    console.log('Atualizando status da proposta...');
    const { error: updateError } = await supabase
      .from('proposals')
      .update({ 
        status: 'enviada',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      // Não falhar aqui, apenas logar
    }

    console.log('Processo finalizado com sucesso');

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResult.id,
      message: 'Proposta enviada com sucesso!',
      publicUrl: finalPublicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-proposal-email function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
