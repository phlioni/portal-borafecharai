
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, type, clientEmail, clientName, proposalTitle, scheduledDate, scheduledTime } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada')
    }

    let subject = ''
    let htmlContent = ''

    switch (type) {
      case 'scheduled':
        subject = `Serviço Agendado - ${proposalTitle}`
        htmlContent = `
          <h2>Seu serviço foi agendado!</h2>
          <p>Olá ${clientName},</p>
          <p>Seu serviço "<strong>${proposalTitle}</strong>" foi agendado para:</p>
          <p><strong>Data:</strong> ${scheduledDate}</p>
          <p><strong>Horário:</strong> ${scheduledTime}</p>
          <p>Aguardamos você!</p>
        `
        break
        
      case 'rescheduled':
        subject = `Serviço Reagendado - ${proposalTitle}`
        htmlContent = `
          <h2>Seu serviço foi reagendado</h2>
          <p>Olá ${clientName},</p>
          <p>Seu serviço "<strong>${proposalTitle}</strong>" foi reagendado para:</p>
          <p><strong>Nova Data:</strong> ${scheduledDate}</p>
          <p><strong>Novo Horário:</strong> ${scheduledTime}</p>
          <p>Qualquer dúvida, entre em contato conosco.</p>
        `
        break
        
      case 'completed':
        subject = `Serviço Finalizado - ${proposalTitle}`
        htmlContent = `
          <h2>Seu serviço foi finalizado!</h2>
          <p>Olá ${clientName},</p>
          <p>Seu serviço "<strong>${proposalTitle}</strong>" foi finalizado com sucesso.</p>
          <p>Obrigado por confiar em nossos serviços!</p>
        `
        break
        
      case 'cancelled':
        subject = `Serviço Cancelado - ${proposalTitle}`
        htmlContent = `
          <h2>Seu serviço foi cancelado</h2>
          <p>Olá ${clientName},</p>
          <p>Infelizmente, seu serviço "<strong>${proposalTitle}</strong>" foi cancelado.</p>
          <p>Entre em contato conosco se tiver alguma dúvida.</p>
        `
        break
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'BoraFecharAI <noreply@borafecharai.com>',
        to: [clientEmail],
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Erro do Resend: ${error}`)
    }

    const data = await res.json()
    console.log('Email enviado com sucesso:', data)

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
})
