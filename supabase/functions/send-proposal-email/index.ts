
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
    
    if (req.method !== 'POST') {
      console.error('Método não permitido:', req.method);
      return new Response(JSON.stringify({ 
        error: 'Método não permitido. Use POST.' 
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    if (!proposalId || !recipientEmail || !recipientName) {
      console.error('Dados obrigatórios ausentes:', { proposalId, recipientEmail, recipientName });
      return new Response(JSON.stringify({ 
        error: 'Dados obrigatórios não fornecidos: proposalId, recipientEmail, recipientName' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
    
    // Buscar dados completos da proposta incluindo itens do orçamento e empresa do usuário
    console.log('Buscando proposta completa:', proposalId);
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        companies (
          name,
          email,
          phone
        ),
        proposal_budget_items (
          id,
          type,
          description,
          quantity,
          unit_price,
          total_price
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

    // Buscar dados da empresa do usuário que criou a proposta
    console.log('Buscando dados da empresa do usuário...');
    const { data: userCompany, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', proposal.user_id)
      .single();

    if (companyError) {
      console.warn('Erro ao buscar empresa do usuário:', companyError);
    }

    console.log('Proposta encontrada:', proposal.title);
    console.log('Itens do orçamento:', proposal.proposal_budget_items?.length || 0);

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

    // Função para formatar moeda
    const formatCurrency = (value: number) => {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    // Função para obter número da proposta
    const getProposalNumber = () => {
      const shortId = proposal.id.slice(-6).toUpperCase();
      return `016-${shortId}`;
    };

    // Separar itens por tipo
    const services = proposal.proposal_budget_items?.filter((item: any) => item.type === 'labor') || [];
    const materials = proposal.proposal_budget_items?.filter((item: any) => item.type === 'material') || [];
    
    const servicesTotal = services.reduce((total: number, item: any) => total + (item.total_price || 0), 0);
    const materialsTotal = materials.reduce((total: number, item: any) => total + (item.total_price || 0), 0);
    const grandTotal = servicesTotal + materialsTotal;

    // Gerar tabelas HTML para os itens
    const generateItemsTable = (items: any[], title: string) => {
      if (items.length === 0) return '';
      
      return `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 12px; background-color: #f3f4f6; padding: 8px;">${title}</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid #d1d5db;">
                <th style="text-align: left; padding: 8px; font-weight: 600;">Descrição</th>
                <th style="text-align: center; padding: 8px; font-weight: 600;">Unidade</th>
                <th style="text-align: center; padding: 8px; font-weight: 600;">Preço unitário</th>
                <th style="text-align: center; padding: 8px; font-weight: 600;">Qtd.</th>
                <th style="text-align: right; padding: 8px; font-weight: 600;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px;">${item.description}</td>
                  <td style="text-align: center; padding: 8px;">unidade</td>
                  <td style="text-align: center; padding: 8px;">${formatCurrency(item.unit_price)}</td>
                  <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px;">${formatCurrency(item.total_price || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    // Template de email completo com a proposta detalhada
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
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #f8f9fa;
            }
            .email-container {
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              margin-bottom: 20px;
            }
            .email-header { 
              text-align: center; 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
              color: white; 
              padding: 30px 20px;
            }
            .email-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .email-header p {
              margin: 8px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .email-content { 
              padding: 30px 20px;
            }
            .email-content p {
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
            }
            .proposal-container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              margin: 20px 0;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .proposal-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 32px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .company-info h1 {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin: 0 0 8px 0;
            }
            .company-details {
              font-size: 14px;
              color: #6b7280;
              line-height: 1.4;
            }
            .proposal-number {
              background-color: #f3f4f6;
              padding: 16px;
              border-radius: 6px;
              margin-bottom: 24px;
            }
            .proposal-number h2 {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 4px 0;
            }
            .client-section {
              margin-bottom: 24px;
            }
            .client-section h3 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .totals-section {
              text-align: right;
              margin: 24px 0;
              font-size: 14px;
            }
            .totals-section .total-line {
              margin: 8px 0;
            }
            .totals-section .grand-total {
              font-size: 18px;
              font-weight: bold;
              border-top: 1px solid #d1d5db;
              padding-top: 8px;
            }
            .payment-section {
              margin: 24px 0;
            }
            .payment-section h3 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .footer-signature {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #d1d5db;
            }
            .email-footer { 
              background: #f8f9fa;
              padding: 30px 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .email-footer p {
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
            .button-container {
              text-align: center;
              margin: 24px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>${proposal.title}</h1>
              <p>Proposta Comercial</p>
            </div>

            <div class="email-content">
              ${processedEmailMessage.split('\n').map((line: string) => {
                if (line.includes(finalPublicUrl)) {
                  return `
                    <div class="button-container">
                      <a href="${finalPublicUrl}" class="proposal-button">
                        📄 Visualizar Proposta Online
                      </a>
                    </div>
                  `;
                }
                return line ? `<p>${line}</p>` : '<br>';
              }).join('')}
            </div>
          </div>

          <!-- Proposta Completa Incorporada -->
          <div class="proposal-container">
            <!-- Cabeçalho da Empresa -->
            <div class="proposal-header">
              <div class="company-info">
                <h1>${userCompany?.name || 'NOME DA EMPRESA'}</h1>
                <div class="company-details">
                  ${userCompany?.address ? `<div>${userCompany.address}</div>` : ''}
                  ${userCompany?.city && userCompany?.state ? `<div>${userCompany.city}, ${userCompany.state}</div>` : ''}
                  ${userCompany?.zip_code ? `<div>CEP ${userCompany.zip_code}</div>` : ''}
                  ${userCompany?.website ? `<div>🌐 ${userCompany.website}</div>` : ''}
                  ${userCompany?.phone ? `<div>📞 ${userCompany.phone}</div>` : ''}
                </div>
              </div>
              <div style="text-align: right; font-size: 14px;">
                <div>📅 ${new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <!-- Número do Orçamento -->
            <div class="proposal-number">
              <h2>Orçamento ${getProposalNumber()}</h2>
              <div style="font-size: 14px; color: #6b7280;">Toledo MG</div>
            </div>

            <!-- Cliente -->
            <div class="client-section">
              <h3>Cliente: ${proposal.companies?.name || recipientName}</h3>
            </div>

            <!-- Serviços -->
            ${generateItemsTable(services, 'Serviços')}

            <!-- Materiais -->
            ${generateItemsTable(materials, 'Materiais')}

            <!-- Totais -->
            ${proposal.proposal_budget_items && proposal.proposal_budget_items.length > 0 ? `
              <div class="totals-section">
                <div class="total-line">Serviços: ${formatCurrency(servicesTotal)}</div>
                <div class="total-line">Materiais: ${formatCurrency(materialsTotal)}</div>
                <div class="total-line grand-total">Total: ${formatCurrency(grandTotal)}</div>
              </div>
            ` : ''}

            <!-- Pagamento -->
            <div class="payment-section">
              <h3>Pagamento</h3>
              <div style="font-size: 14px;">
                <div><strong>Meios de pagamento</strong></div>
                <div>Boleto, transferência bancária, dinheiro, cheque, cartão de crédito ou cartão de débito.</div>
                ${proposal.delivery_time ? `<div style="margin-top: 8px;"><strong>Prazo:</strong> ${proposal.delivery_time}</div>` : ''}
              </div>
            </div>

            <!-- Footer da Proposta -->
            <div class="footer-signature">
              <div style="font-size: 14px;">${userCompany?.city || 'Cidade'}, ${new Date().toLocaleDateString('pt-BR')}</div>
              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <div style="font-weight: bold;">${userCompany?.name || 'NOME DA EMPRESA'}</div>
                <div style="font-size: 14px;">Responsável</div>
              </div>
              <div style="font-size: 12px; margin-top: 16px;">Página 1/1</div>
            </div>
          </div>

          <div class="email-footer">
            <p><strong>💡 Dica:</strong> Você pode visualizar esta proposta online ou baixar em PDF clicando no botão acima.</p>
            
            <div class="branding">
              <p>Esta proposta foi criada com <a href="https://borafecharai.com" target="_blank">BoraFechar AI</a> - A inteligência que acelera seus negócios</p>
              <p>Proposta gerada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
              ${proposal.validity_date ? `<p><strong>⚠️ Atenção:</strong> Esta proposta expira em ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Enviando email via Resend...');

    const emailPayload = {
      from: 'Propostas <propostas@borafecharai.com>',
      to: [recipientEmail],
      subject: emailSubject || `Sua proposta para o projeto ${proposal.title} está pronta`,
      html: proposalHtml,
      text: processedEmailMessage,
    };

    console.log('Payload do email preparado');

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
