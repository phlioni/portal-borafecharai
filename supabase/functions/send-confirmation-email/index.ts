
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

    // URL de confirmação com melhor handling
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || 'https://www.borafecharai.com/dashboard')}`;

    console.log('URL de confirmação:', confirmationUrl);

    const emailPayload = {
      from: 'BoraFecharAI - Propostas Inteligentes <noreply@borafecharai.com>',
      to: [user.email],
      subject: '🚀 Confirme seu cadastro e comece a criar propostas que vendem!',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme seu cadastro - BoraFecharAI</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              line-height: 1.6;
              color: #334155;
              background-color: #f8fafc;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            
            .logo-container {
              background-color: rgba(255, 255, 255, 0.15);
              display: inline-block;
              padding: 16px;
              border-radius: 16px;
              margin-bottom: 20px;
              backdrop-filter: blur(10px);
            }
            
            .main-content {
              padding: 40px 30px;
            }
            
            .welcome-title {
              color: #1e293b;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 16px;
              text-align: center;
              line-height: 1.2;
            }
            
            .intro-text {
              color: #475569;
              font-size: 18px;
              line-height: 1.6;
              margin-bottom: 30px;
              text-align: center;
            }
            
            .highlight-box {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border-radius: 16px;
              padding: 30px;
              margin: 30px 0;
              border-left: 5px solid #667eea;
              text-align: center;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 18px 36px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 18px;
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
              transition: all 0.3s ease;
              text-align: center;
              margin: 20px 0;
            }
            
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            
            .feature-item {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            
            .footer {
              background-color: #f8fafc;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .trial-badge {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: white;
              padding: 12px 24px;
              border-radius: 25px;
              font-weight: 600;
              display: inline-block;
              margin: 20px 0;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 12px;
              }
              
              .header, .main-content, .footer {
                padding: 20px;
              }
              
              .welcome-title {
                font-size: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo-container">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 13H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 9H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">BoraFecharAI</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 8px 0 0 0; font-weight: 500;">Propostas que Convertem</p>
            </div>

            <!-- Content -->
            <div class="main-content">
              <h2 class="welcome-title">
                🎉 Bem-vindo ao futuro das propostas comerciais!
              </h2>
              
              <p class="intro-text">
                <strong>Parabéns!</strong> Você está a apenas <u>um clique</u> de transformar completamente a forma como cria propostas e fecha negócios.
              </p>

              <div class="trial-badge">
                ⚡ TRIAL GRATUITO: 30 dias + 20 propostas grátis
              </div>

              <div class="highlight-box">
                <h3 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
                  🔐 Confirme seu email para ativar sua conta
                </h3>
                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">
                  Por questões de segurança, precisamos confirmar que este email realmente pertence a você. 
                  <strong>É rápido e simples!</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${confirmationUrl}" class="cta-button">
                  🚀 CONFIRMAR EMAIL E COMEÇAR AGORA
                </a>
              </div>

              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; text-align: center;">
                  🎯 O que você vai conseguir fazer:
                </h3>
                
                <div class="features-grid">
                  <div class="feature-item">
                    <div style="font-size: 24px; margin-bottom: 10px;">📝</div>
                    <h4 style="color: #1e293b; font-weight: 600; margin: 0 0 8px 0;">Propostas em Minutos</h4>
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Crie propostas profissionais em poucos cliques com nossa IA</p>
                  </div>
                  
                  <div class="feature-item">
                    <div style="font-size: 24px; margin-bottom: 10px;">📈</div>
                    <h4 style="color: #1e293b; font-weight: 600; margin: 0 0 8px 0;">+80% Aprovação</h4>
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Propostas otimizadas que realmente convertem</p>
                  </div>
                  
                  <div class="feature-item">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚡</div>
                    <h4 style="color: #1e293b; font-weight: 600; margin: 0 0 8px 0;">Envio Automático</h4>
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Envie por email com rastreamento de visualizações</p>
                  </div>
                  
                  <div class="feature-item">
                    <div style="font-size: 24px; margin-bottom: 10px;">🎨</div>
                    <h4 style="color: #1e293b; font-weight: 600; margin: 0 0 8px 0;">Templates Premium</h4>
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Designs profissionais que impressionam</p>
                  </div>
                </div>
              </div>

              <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin: 30px 0; border: 1px solid #fbbf24; text-align: center;">
                <p style="color: #92400e; font-size: 16px; margin: 0; font-weight: 500;">
                  ⏰ <strong>Oferta limitada:</strong> Primeiros 1000 usuários ganham acesso vitalício aos templates premium!
                </p>
              </div>

              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">
                  Problemas com o botão? Copie e cole este link no seu navegador:
                </p>
                <div style="background-color: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; word-break: break-all; font-family: monospace; font-size: 12px; color: #3b82f6;">
                  ${confirmationUrl}
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  💡 <strong>Dica:</strong> Adicione <strong>noreply@borafecharai.com</strong> aos seus contatos para não perder nenhuma atualização importante!
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">BoraFecharAI</h3>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
                A plataforma de propostas comerciais que está revolucionando o mercado brasileiro
              </p>
              
              <div style="margin: 20px 0;">
                <a href="https://www.borafecharai.com" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px; font-weight: 500;">🌐 Site</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="https://www.borafecharai.com/termos-de-uso" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px; font-weight: 500;">📄 Termos</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="https://www.borafecharai.com/suporte" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px; font-weight: 500;">💬 Suporte</a>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">
                Se você não criou esta conta, pode ignorar este email com segurança.<br>
                © 2024 BoraFecharAI. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🚀 CONFIRME SEU CADASTRO - BoraFecharAI

Olá!

Parabéns! Você está a apenas um clique de transformar completamente a forma como cria propostas e fecha negócios.

⚡ TRIAL GRATUITO: 30 dias + 20 propostas grátis

🔐 CONFIRME SEU EMAIL PARA ATIVAR SUA CONTA

Por questões de segurança, precisamos confirmar que este email realmente pertence a você.

Clique no link abaixo para confirmar:
${confirmationUrl}

🎯 O QUE VOCÊ VAI CONSEGUIR FAZER:

📝 Propostas em Minutos - Crie propostas profissionais em poucos cliques
📈 +80% Aprovação - Propostas otimizadas que realmente convertem  
⚡ Envio Automático - Envie por email com rastreamento
🎨 Templates Premium - Designs profissionais que impressionam

⏰ OFERTA LIMITADA: Primeiros 1000 usuários ganham acesso vitalício aos templates premium!

---
BoraFecharAI - A plataforma que está revolucionando o mercado brasileiro
Site: https://www.borafecharai.com

Se você não criou esta conta, pode ignorar este email com segurança.
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
