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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== Iniciando processamento de envio de email ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      console.error('Método não permitido:', req.method);
      return new Response(JSON.stringify({ 
        error: 'Método não permitido. Use POST.' 
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse do body da requisição
    let body;
    try {
      const bodyText = await req.text();
      console.log('Body raw:', bodyText);
      body = JSON.parse(bodyText);
      console.log('Body parsed:', body);
    } catch (parseError) {
      console.error('Erro ao fazer parse do body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Dados inválidos no corpo da requisição' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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
      console.error('Dados obrigatórios ausentes:', { proposalId, recipientEmail, recipientName });
      return new Response(JSON.stringify({ 
        error: 'Dados obrigatórios não fornecidos: proposalId, recipientEmail, recipientName' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se a chave do Resend está configurada
    if (!resendApiKey) {
      console.error('RESEND_API_KEY não configurada');
      return new Response(JSON.stringify({ 
        error: 'Configuração de email não encontrada. Verifique se RESEND_API_KEY está configurada.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ 
        error: `Erro ao buscar proposta: ${error.message}` 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!proposal) {
      console.error('Proposta não encontrada');
      return new Response(JSON.stringify({ 
        error: 'Proposta não encontrada' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Proposta encontrada:', proposal.title);

    // URL pública da proposta - corrigir a construção da URL
    let finalPublicUrl = publicUrl;
    if (!finalPublicUrl) {
      // Usar o domínio correto baseado no ambiente
      const baseUrl = supabaseUrl.includes('localhost') 
        ? 'http://localhost:8080' 
        : supabaseUrl.replace('/rest/v1', '').replace('supabase.co', 'vercel.app');
      finalPublicUrl = `${baseUrl}/proposta/${proposal.public_hash}`;
    }
    console.log('URL pública final:', finalPublicUrl);

    // Template de email personalizado ou padrão
    const defaultSubject = `Proposta: ${proposal.title}`;
    const defaultMessage = `
Olá ${recipientName},

Estou enviando a proposta "${proposal.title}" para sua análise.

Esta proposta é válida por tempo limitado. Clique no link abaixo para visualizar:

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
            
            <p>${emailMessage ? emailMessage.replace(/\n/g, '<br>').replace('[LINK_DA_PROPOSTA]', `<a href="${finalPublicUrl}" class="button">Ver Proposta</a>`) : defaultMessage.replace(/\n/g, '<br>')}</p>
            
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
    console.log('Resend API Key presente:', !!resendApiKey);

    // Enviar email via Resend
    const emailPayload = {
      from: 'Propostas <contato@borafecharai.com>',
      to: [recipientEmail],
      subject: emailSubject || defaultSubject,
      html: proposalHtml,
    };

    console.log('Payload do email:', {
      ...emailPayload,
      html: '[HTML_CONTENT]' // Não logar o HTML completo
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResponseText = await emailResponse.text();
    console.log('Status da resposta do Resend:', emailResponse.status);
    console.log('Resposta do Resend (raw):', emailResponseText);

    if (!emailResponse.ok) {
      console.error('Erro do Resend:', emailResponseText);
      return new Response(JSON.stringify({ 
        error: `Erro ao enviar email via Resend: ${emailResponseText}`,
        details: {
          status: emailResponse.status,
          response: emailResponseText
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let emailResult;
    try {
      emailResult = JSON.parse(emailResponseText);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta do Resend:', parseError);
      emailResult = { id: 'unknown', message: 'Email enviado mas resposta não pôde ser parseada' };
    }

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

    console.log('=== Processo finalizado com sucesso ===');

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResult.id || 'sent',
      message: 'Proposta enviada com sucesso!',
      publicUrl: finalPublicUrl
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== Erro geral na função ===');
    console.error('Error in send-proposal-email function:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      details: error.stack || 'Stack trace não disponível'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
