
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Iniciando processamento de envio de email ===');
    
    const body = await req.text();
    console.log('Body raw:', body);
    
    const bodyData = JSON.parse(body);
    console.log('Body parsed:', bodyData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    console.log('Conectando ao Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { proposalId, recipientEmail, recipientName, emailSubject, emailMessage, publicUrl } = bodyData;

    console.log('Buscando proposta completa:', proposalId);

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        companies (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError) {
      console.error('Erro ao buscar proposta:', proposalError);
      throw proposalError;
    }

    console.log('Proposta encontrada:', proposal.title);

    // Buscar dados da empresa do usuário
    console.log('Buscando dados da empresa do usuário...');
    const { data: userCompany, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', proposal.user_id)
      .single();

    if (companyError) {
      console.error('Erro ao buscar empresa do usuário:', companyError);
    }

    // Buscar perfil do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', proposal.user_id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil do usuário:', profileError);
    }

    // Buscar itens do orçamento
    const { data: budgetItems, error: budgetError } = await supabase
      .from('proposal_budget_items')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true });

    console.log('Itens do orçamento:', budgetItems?.length || 0);

    // Preparar dados para o template de email
    const companyName = userCompany?.name || 'Nome da Empresa';
    const companyLogo = userCompany?.logo_url || '';
    const responsibleName = userProfile?.name || proposal.user_id;
    const companyEmail = userCompany?.email || '';
    const companyPhone = userCompany?.phone || userProfile?.phone || '';

    // Gerar HTML da proposta para incluir no email
    const proposalHtml = generateProposalHtml({
      proposal,
      userCompany,
      userProfile,
      budgetItems: budgetItems || [],
      companyLogo
    });

    const resend = new Resend(resendApiKey);

    console.log('URL pública final:', publicUrl);
    console.log('Payload do email preparado');

    const emailPayload = {
      from: `${companyName} <onboarding@resend.dev>`,
      to: [recipientEmail],
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-height: 80px; margin-bottom: 20px;">` : ''}
            <h1 style="color: #333; margin: 0;">${companyName}</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <div style="white-space: pre-line; color: #333; line-height: 1.6; margin-bottom: 30px;">
              ${emailMessage}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${publicUrl}" 
                 style="display: inline-block; background-color: #007bff; color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">
                Visualizar Proposta Completa
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">Prévia da Proposta:</h3>
              ${proposalHtml}
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0;"><strong>${companyName}</strong></p>
            <p style="margin: 5px 0;">${responsibleName}</p>
            ${companyEmail ? `<p style="margin: 5px 0;">📧 ${companyEmail}</p>` : ''}
            ${companyPhone ? `<p style="margin: 5px 0;">📱 ${companyPhone}</p>` : ''}
          </div>
        </div>
      `
    };

    console.log('Enviando email via Resend...');
    const emailResponse = await resend.emails.send(emailPayload);
    console.log('Status da resposta do Resend:', emailResponse ? 200 : 'Error');
    console.log('Email enviado com sucesso:', emailResponse);

    console.log('Atualizando status da proposta...');
    await supabase
      .from('proposals')
      .update({ 
        status: 'enviada',
        views: (proposal.views || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', proposalId);

    console.log('=== Processo finalizado com sucesso ===');

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function generateProposalHtml({ proposal, userCompany, userProfile, budgetItems, companyLogo }) {
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const services = budgetItems.filter(item => item.type === 'labor');
  const materials = budgetItems.filter(item => item.type === 'material');
  
  const servicesTotal = services.reduce((total, item) => total + (item.total_price || 0), 0);
  const materialsTotal = materials.reduce((total, item) => total + (item.total_price || 0), 0);
  const grandTotal = servicesTotal + materialsTotal;

  return `
    <div style="background: white; padding: 20px; border: 1px solid #eee; border-radius: 8px; font-size: 14px;">
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
        ${companyLogo ? `<img src="${companyLogo}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;">` : ''}
        <h2 style="margin: 0; color: #333;">${userCompany?.name || 'Nome da Empresa'}</h2>
        <p style="margin: 5px 0; color: #666;">Orçamento ${proposal.id.slice(-6).toUpperCase()}</p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h3 style="color: #333; margin-bottom: 5px;">Cliente: ${proposal.companies?.name || 'Nome do Cliente'}</h3>
      </div>

      ${services.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h4 style="background: #f5f5f5; padding: 8px; margin: 0 0 10px 0; color: #333;">Serviços</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding: 5px;">Descrição</th>
                <th style="text-align: center; padding: 5px;">Qtd.</th>
                <th style="text-align: right; padding: 5px;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 5px;">${item.description}</td>
                  <td style="text-align: center; padding: 5px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 5px;">${formatCurrency(item.total_price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${materials.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h4 style="background: #f5f5f5; padding: 8px; margin: 0 0 10px 0; color: #333;">Materiais</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding: 5px;">Descrição</th>
                <th style="text-align: center; padding: 5px;">Qtd.</th>
                <th style="text-align: right; padding: 5px;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${materials.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 5px;">${item.description}</td>
                  <td style="text-align: center; padding: 5px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 5px;">${formatCurrency(item.total_price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${budgetItems.length > 0 ? `
        <div style="text-align: right; margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
          <p style="margin: 2px 0;">Serviços: ${formatCurrency(servicesTotal)}</p>
          <p style="margin: 2px 0;">Materiais: ${formatCurrency(materialsTotal)}</p>
          <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">Total: ${formatCurrency(grandTotal)}</p>
        </div>
      ` : ''}
    </div>
  `;
}
