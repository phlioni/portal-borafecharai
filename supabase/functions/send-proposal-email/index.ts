
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log('=== Iniciando processamento de envio de email ===');
    
    const body = await req.text();
    console.log('Body raw:', body);
    const bodyData = JSON.parse(body);
    console.log('Body parsed:', bodyData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

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

    // Preparar dados para o template de email
    const companyName = userCompany?.name || 'Nome da Empresa';
    const companyLogo = userCompany?.logo_url || '';
    const responsibleName = userProfile?.name || proposal.user_id;
    const companyEmail = userCompany?.email || '';
    const companyPhone = userCompany?.phone || userProfile?.phone || '';

    const resend = new Resend(resendApiKey);

    console.log('URL pública final:', publicUrl);
    console.log('Payload do email preparado');

    // Processar a mensagem para melhorar espaçamento e remover link
    const processedMessage = emailMessage
      .replace(/\[LINK_DA_PROPOSTA\]/g, '') // Remove o placeholder do link
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0) // Remove linhas vazias
      .join('<br><br>'); // Adiciona quebras de linha duplas para melhor espaçamento

    const emailPayload = {
      from: `Propostas <proposta@borafecharai.com>`,
      to: [recipientEmail],
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">${proposal.title}</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Proposta Comercial</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <div style="color: #333; margin-bottom: 40px; font-size: 16px;">
              ${processedMessage}
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${publicUrl}" 
                 style="display: inline-block; background-color: #007bff; color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                📄 Visualizar Proposta Completa
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee;">
            <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">${companyName}</p>
            <p style="margin: 5px 0;">${responsibleName}</p>
            ${companyEmail ? `<p style="margin: 8px 0;">📧 ${companyEmail}</p>` : ''}
            ${companyPhone ? `<p style="margin: 8px 0;">📱 ${companyPhone}</p>` : ''}
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

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.id
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
