
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

    // Template de email otimizado
    const defaultSubject = `Sua proposta para o projeto ${proposal.title} está pronta`;
    const defaultMessage = `
Olá ${recipientName},

Espero que esteja bem!

Sua proposta para o projeto "${proposal.title}" está finalizada e disponível para visualização.

Preparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no link abaixo:

${finalPublicUrl}

Resumo do que incluímos:
• Análise detalhada do seu projeto
• Cronograma personalizado
• Investimento transparente
• Suporte durante toda a execução

Informações da proposta:
${proposal.value ? `• Investimento: R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
${proposal.delivery_time ? `• Prazo: ${proposal.delivery_time}` : ''}
${proposal.validity_date ? `• Válida até: ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}` : ''}

Fico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.

Aguardo seu retorno!

Atenciosamente,
Equipe Bora Fechar AI
    `.trim();

    // Construir HTML otimizado da proposta para o email
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
            .button { 
              display: inline-block; 
              background: #4f46e5; 
              color: white; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0; 
              text-align: center;
            }
            .button:hover {
              background: #4338ca;
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
            .footer .company-info {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .footer .company-info p {
              margin: 4px 0;
            }
            .unsubscribe {
              margin-top: 20px;
              font-size: 12px;
              color: #9ca3af;
            }
            .unsubscribe a {
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${proposal.title}</h1>
              <p>Proposta Comercial</p>
            </div>

            <div class="content">
              <p>Olá <strong>${recipientName}</strong>,</p>
              
              ${emailMessage ? 
                emailMessage.replace(/\n/g, '</p><p>').replace('[LINK_DA_PROPOSTA]', `</p><div style="text-align: center;"><a href="${finalPublicUrl}" class="button">📄 Visualizar Proposta Completa</a></div><p>`)
                : 
                `<p>Espero que esteja bem!</p>
                <p>Sua proposta para o projeto "<strong>${proposal.title}</strong>" está finalizada e disponível para visualização.</p>
                <p>Preparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no botão abaixo:</p>
                <div style="text-align: center;">
                  <a href="${finalPublicUrl}" class="button">📄 Visualizar Proposta Completa</a>
                </div>
                <p>Resumo do que incluímos:</p>
                <ul>
                  <li>Análise detalhada do seu projeto</li>
                  <li>Cronograma personalizado</li>
                  <li>Investimento transparente</li>
                  <li>Suporte durante toda a execução</li>
                </ul>`
              }
              
              <div class="proposal-details">
                <h3>Resumo da Proposta</h3>
                ${proposal.service_description ? `<p><strong>Serviço:</strong> ${proposal.service_description}</p>` : ''}
                ${proposal.value ? `<p><strong>Investimento:</strong> R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>` : ''}
                ${proposal.delivery_time ? `<p><strong>Prazo:</strong> ${proposal.delivery_time}</p>` : ''}
                ${proposal.validity_date ? `<p><strong>Válida até:</strong> ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
              </div>

              <p>Fico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.</p>
              <p>Aguardo seu retorno!</p>
              <p>Atenciosamente,<br><strong>Equipe Bora Fechar AI</strong></p>
            </div>

            <div class="footer">
              <p><strong>💡 Dica:</strong> Na página da proposta, você pode baixar o arquivo em PDF para guardar ou imprimir.</p>
              
              <div class="company-info">
                <p><strong>Bora Fechar AI</strong></p>
                <p>Rua das Tecnologias, 123 - Centro</p>
                <p>São Paulo, SP - CEP: 01234-567</p>
                <p>Telefone: (11) 9999-8888</p>
                <p>Site: <a href="https://www.borafecharai.com" style="color: #4f46e5;">www.borafecharai.com</a></p>
              </div>

              <div class="unsubscribe">
                <p>Se não quiser mais receber e-mails sobre esta proposta, <a href="${finalPublicUrl}">clique aqui para gerenciar suas preferências</a>.</p>
                <p>Esta proposta foi gerada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
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
      from: 'Bora Fechar AI <propostas@borafecharai.com>',
      to: [recipientEmail],
      subject: emailSubject || defaultSubject,
      html: proposalHtml,
      text: emailMessage ? emailMessage.replace('[LINK_DA_PROPOSTA]', finalPublicUrl) : defaultMessage,
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
