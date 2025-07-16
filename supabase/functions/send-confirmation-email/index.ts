
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
    console.log('=== Iniciando envio de email de confirmação ===');
    
    const { user, email_data } = await req.json();
    const { token, token_hash, redirect_to, email_action_type } = email_data;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado');
    }

    const resend = new Resend(resendApiKey);

    // URL de confirmação corrigida
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || 'https://www.borafecharai.com/dashboard')}`;

    console.log('URL de confirmação:', confirmationUrl);

    const emailPayload = {
      from: 'BoraFecharAI <noreply@borafecharai.com>',
      to: [user.email],
      subject: '✅ Confirme seu cadastro - BoraFecharAI',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme seu cadastro</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); display: inline-block; padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color: white; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: -0.5px;">BoraFecharAI</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0;">Propostas Inteligentes</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                Bem-vindo ao BoraFecharAI! 🎉
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Falta apenas um passo para começar a criar propostas incríveis que convertem mais clientes.
              </p>

              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #667eea;">
                <p style="color: #334155; font-size: 16px; margin: 0 0 16px 0; font-weight: 500;">
                  📧 Confirme seu email para ativar sua conta
                </p>
                <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">
                  Clique no botão abaixo para confirmar seu endereço de email e começar seu trial gratuito de 30 dias.
                </p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
                  ✅ Confirmar Email e Ativar Conta
                </a>
              </div>

              <div style="background-color: #fefce8; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #fde047;">
                <p style="color: #a16207; font-size: 14px; margin: 0; text-align: center;">
                  <strong>⏰ Trial Gratuito:</strong> 30 dias + até 20 propostas grátis
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

              <div style="text-align: center;">
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  🚀 O que você pode fazer com o BoraFecharAI:
                </h3>
                
                <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                  <div style="margin: 12px 0; padding: 8px 0;">
                    <span style="color: #10b981; font-weight: 600;">✨</span>
                    <span style="color: #475569; margin-left: 8px;">Criar propostas profissionais em minutos</span>
                  </div>
                  <div style="margin: 12px 0; padding: 8px 0;">
                    <span style="color: #10b981; font-weight: 600;">🎯</span>
                    <span style="color: #475569; margin-left: 8px;">Aumentar taxa de aprovação em até 80%</span>
                  </div>
                  <div style="margin: 12px 0; padding: 8px 0;">
                    <span style="color: #10b981; font-weight: 600;">📊</span>
                    <span style="color: #475569; margin-left: 8px;">Acompanhar status e visualizações</span>
                  </div>
                  <div style="margin: 12px 0; padding: 8px 0;">
                    <span style="color: #10b981; font-weight: 600;">⚡</span>
                    <span style="color: #475569; margin-left: 8px;">Enviar por email com um clique</span>
                  </div>
                </div>
              </div>

              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
                  Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>
                <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 0; background-color: white; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  ${confirmationUrl}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
                <strong>BoraFecharAI</strong> - A inteligência que falta para suas propostas
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Se você não criou esta conta, pode ignorar este email com segurança.
              </p>
              <div style="margin-top: 16px;">
                <a href="https://www.borafecharai.com" style="color: #64748b; text-decoration: none; margin: 0 8px; font-size: 12px;">🌐 Site</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="https://www.borafecharai.com/termos-de-uso" style="color: #64748b; text-decoration: none; margin: 0 8px; font-size: 12px;">📄 Termos</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('Enviando email de confirmação...');
    const emailResponse = await resend.emails.send(emailPayload);

    console.log('Email de confirmação enviado:', emailResponse);

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
    console.error('Erro no envio de email de confirmação:', error);
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
