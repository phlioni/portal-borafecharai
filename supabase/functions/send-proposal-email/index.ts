
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
    const { proposalId, emailData } = await req.json()

    console.log('Enviando proposta por email:', { proposalId, emailData })

    // Buscar proposta com cliente
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        ),
        proposal_budget_items (
          id,
          description,
          quantity,
          unit_price,
          total_price,
          type
        )
      `)
      .eq('id', proposalId)
      .single()

    if (proposalError) {
      console.error('Erro ao buscar proposta:', proposalError)
      return new Response(
        JSON.stringify({ error: 'Proposta não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar dados da empresa do usuário
    const { data: userCompany } = await supabase
      .from('user_companies')
      .select('*')
      .eq('user_id', proposal.user_id)
      .single()

    // Buscar template de email personalizado
    const { data: emailTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', proposal.user_id)
      .single()

    // Calcular valor total da proposta
    const totalValue = proposal.proposal_budget_items?.reduce((total: number, item: any) => {
      return total + (item.quantity * item.unit_price)
    }, 0) || proposal.value || 0

    // Gerar link público da proposta
    const publicLink = `https://pakrraqbjbkkbdnwkkbt.supabase.co/proposta/${proposal.public_hash}`

    // Montar dados para o template
    const templateData = {
      proposalTitle: proposal.title,
      proposalValue: totalValue,
      clientName: proposal.clients?.name || 'Cliente',
      companyName: userCompany?.name || 'Empresa',
      publicLink,
      deliveryTime: proposal.delivery_time,
      validityDate: proposal.validity_date,
      serviceDescription: proposal.service_description,
      detailedDescription: proposal.detailed_description,
      observations: proposal.observations,
      companyEmail: userCompany?.email,
      companyPhone: userCompany?.phone,
      companyAddress: userCompany?.address
    }

    // Usar template personalizado se disponível
    let emailSubject = emailTemplate?.email_subject_template || 'Proposta Comercial: {{proposalTitle}}'
    let emailMessage = emailTemplate?.email_message_template || `
Olá {{clientName}},

Segue em anexo nossa proposta comercial para o projeto "{{proposalTitle}}".

Valor: R$ {{proposalValue}}
Prazo de entrega: {{deliveryTime}}
Validade: {{validityDate}}

Você pode visualizar e responder a proposta através do link:
{{publicLink}}

Atenciosamente,
{{companyName}}
`

    // Substituir variáveis no template
    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value?.toString() || '')
      emailMessage = emailMessage.replace(new RegExp(placeholder, 'g'), value?.toString() || '')
    })

    // Adicionar assinatura se disponível
    if (emailTemplate?.email_signature) {
      emailMessage += `\n\n${emailTemplate.email_signature}`
    }

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: emailData.from || 'noreply@borafecharai.com',
        to: [emailData.to],
        subject: emailSubject,
        html: emailMessage.replace(/\n/g, '<br>')
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
      .update({ status: 'enviada' })
      .eq('id', proposalId)

    console.log('Email enviado com sucesso para:', emailData.to)

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
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
