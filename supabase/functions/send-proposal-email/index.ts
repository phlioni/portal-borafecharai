
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const resendApiKey = Deno.env.get('RESEND_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('Request body received:', requestBody)

    const { 
      proposalId, 
      recipientEmail, 
      recipientName, 
      emailSubject, 
      emailMessage, 
      publicUrl 
    } = requestBody

    console.log('Enviando proposta por email:', { 
      proposalId, 
      recipientEmail, 
      recipientName, 
      emailSubject 
    })

    // Buscar proposta básica para garantir hash público
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, public_hash, user_id')
      .eq('id', proposalId)
      .single()

    if (proposalError) {
      console.error('Erro ao buscar proposta:', proposalError)
      return new Response(
        JSON.stringify({ error: 'Proposta não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Garantir que existe um hash público válido
    let finalPublicHash = proposal.public_hash
    if (!finalPublicHash || finalPublicHash.length < 16) {
      console.log('Gerando novo hash público para a proposta')
      const encoder = new TextEncoder()
      const data = encoder.encode(`${proposalId}-${Date.now()}-${Math.random()}`)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      finalPublicHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
      
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ 
          public_hash: finalPublicHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        
      if (updateError) {
        console.error('Erro ao atualizar hash público:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao gerar link da proposta' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const finalPublicUrl = `https://www.borafecharai.com/proposta/${finalPublicHash}`
    console.log('URL final da proposta:', finalPublicUrl)

    // Processar template de e-mail apenas com mensagem simples
    const processEmailMessage = (message: string, proposalUrl: string) => {
      const paragraphs = message.split('\n\n').filter(p => p.trim());
      
      return paragraphs.map(paragraph => {
        if (paragraph.includes('[LINK_DA_PROPOSTA]')) {
          const beforeButton = paragraph.split('[LINK_DA_PROPOSTA]')[0];
          const afterButton = paragraph.split('[LINK_DA_PROPOSTA]')[1];
          
          return `
            ${beforeButton ? `<p style="margin: 0 0 32px 0; line-height: 1.9; color: #374151; font-size: 16px;">${beforeButton.replace(/\n/g, '<br><br>')}</p>` : ''}
            <div style="text-align: center; margin: 40px 0;">
              <a href="${proposalUrl}" 
                 style="display: inline-block; 
                        background-color: #2563eb; 
                        color: #ffffff; 
                        padding: 18px 36px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        transition: background-color 0.2s ease;">
                📄 Visualizar Proposta
              </a>
            </div>
            ${afterButton ? `<p style="margin: 32px 0 0 0; line-height: 1.9; color: #374151; font-size: 16px;">${afterButton.replace(/\n/g, '<br><br>')}</p>` : ''}
          `;
        } else {
          return `<p style="margin: 0 0 32px 0; line-height: 1.9; color: #374151; font-size: 16px;">${paragraph.replace(/\n/g, '<br><br>')}</p>`;
        }
      }).join('');
    };

    // Gerar HTML do email apenas com mensagem simples
    const generateEmailHTML = (message: string, proposalUrl: string) => {
      const processedMessage = processEmailMessage(message, proposalUrl);

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                📋 Proposta Comercial
              </h1>
            </div>
            <div style="padding: 40px;">
              ${processedMessage}
              
              <!-- Footer BoraFecharAI -->
              <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 40px;">
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; font-weight: 500;">
                  ✨ Esta proposta foi criada com
                </p>
                <a href="https://www.borafecharai.com" 
                   target="_blank" 
                   style="display: inline-block; 
                          color: #2563eb; 
                          text-decoration: none; 
                          font-size: 20px; 
                          font-weight: 700; 
                          padding: 12px 20px; 
                          border-radius: 8px; 
                          background: rgba(37, 99, 235, 0.1); 
                          transition: all 0.2s ease;
                          border: 2px solid rgba(37, 99, 235, 0.2);">
                  🚀 BoraFecharAI
                </a>
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                  A plataforma que transforma suas propostas em fechamentos
                </p>
              </div>
              
              <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">Esta é uma mensagem automática. Não responda a este email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const emailHTML = generateEmailHTML(emailMessage, finalPublicUrl);

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@borafecharai.com',
        to: [recipientEmail],
        subject: emailSubject,
        html: emailHTML
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Erro ao enviar email via Resend:', errorText)
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar status da proposta para 'enviada'
    await supabase
      .from('proposals')
      .update({ 
        status: 'enviada',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)

    console.log('Email enviado com sucesso para:', recipientEmail)
    console.log('Hash público final:', finalPublicHash)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        publicHash: finalPublicHash,
        publicUrl: finalPublicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no envio de email:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
