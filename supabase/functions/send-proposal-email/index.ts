
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

    // URL pública da proposta
    let finalPublicUrl = publicUrl;
    if (!finalPublicUrl) {
      const baseUrl = supabaseUrl.includes('localhost') 
        ? 'http://localhost:8080' 
        : 'https://preview--proposta-inteligente-brasil.lovable.app';
      finalPublicUrl = `${baseUrl}/proposta/${proposal.public_hash}`;
    }
    console.log('URL pública final:', finalPublicUrl);

    // Processar o link da proposta no emailMessage
    const processedEmailMessage = emailMessage ? 
      emailMessage.replace('[LINK_DA_PROPOSTA]', finalPublicUrl) : 
      `Sua proposta está disponível em: ${finalPublicUrl}`;

    // Template de email otimizado com botão personalizado
    const proposalHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Proposta Comercial - ${proposal.title}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6; 
              color: #333333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header { 
              text-align: center; 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
              color: white; 
              padding: 30px 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content { 
              padding: 30px 20px;
            }
            .content p {
              margin: 0 0 16px 0;
            }
            .proposal-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
              color: white; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0; 
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s ease;
            }
            .proposal-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .proposal-details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin: 24px 0;
              border-left: 4px solid #4f46e5;
            }
            .proposal-details h3 {
              margin: 0 0 16px 0;
              color: #1f2937;
              font-size: 18px;
            }
            .proposal-details p {
              margin: 8px 0;
              color: #4b5563;
            }
            .footer { 
              background: #f8f9fa;
              padding: 30px 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 8px 0;
              color: #6b7280;
              font-size: 14px;
            }
            .branding {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
            .branding a {
              color: #4f46e5;
              text-decoration: none;
            }
            ul {
              padding-left: 20px;
              margin: 16px 0;
            }
            li {
              margin: 8px 0;
              color: #4b5563;
            }
            .button-container {
              text-align: center;
              margin: 24px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${proposal.title}</h1>
              <p>Proposta Comercial</p>
            </div>

            <div class="content">
              ${processedEmailMessage.split('\n').map(line => {
                // Se a linha contém o link da proposta, transformar em botão
                if (line.includes(finalPublicUrl)) {
                  return `
                    <div class="button-container">
                      <a href="${finalPublicUrl}" class="proposal-button">
                        📄 Visualizar Proposta Completa
                      </a>
                    </div>
                  `;
                }
                return line ? `<p>${line}</p>` : '<br>';
              }).join('')}
              
              ${proposal.value || proposal.delivery_time || proposal.validity_date ? `
                <div class="proposal-details">
                  <h3>Resumo da Proposta</h3>
                  ${proposal.service_description ? `<p><strong>Serviço:</strong> ${proposal.service_description}</p>` : ''}
                  ${proposal.value ? `<p><strong>Investimento:</strong> R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>` : ''}
                  ${proposal.delivery_time ? `<p><strong>Prazo:</strong> ${proposal.delivery_time}</p>` : ''}
                  ${proposal.validity_date ? `<p><strong>Válida até:</strong> ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p><strong>💡 Dica:</strong> Na página da proposta, você pode baixar o arquivo em PDF para guardar ou imprimir.</p>
              
              <div class="branding">
                <p>Esta proposta foi criada com <a href="https://borafecharai.com" target="_blank">BoraFechar AI</a> - A inteligência que acelera seus negócios</p>
                <p>Proposta gerada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                ${proposal.validity_date ? `<p><strong>⚠️ Atenção:</strong> Esta proposta expira em ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Enviando email via Resend...');

    // Enviar email via Resend
    const emailPayload = {
      from: 'Propostas <propostas@borafecharai.com>',
      to: [recipientEmail],
      subject: emailSubject || `Sua proposta para o projeto ${proposal.title} está pronta`,
      html: proposalHtml,
      text: processedEmailMessage,
    };

    console.log('Payload do email:', {
      ...emailPayload,
      html: '[HTML_CONTENT]',
      text: '[TEXT_CONTENT]'
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
