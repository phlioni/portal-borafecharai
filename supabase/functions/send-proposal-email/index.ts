
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

    // Calcular valor total da proposta
    const totalValue = proposal.proposal_budget_items?.reduce((total: number, item: any) => {
      return total + (item.quantity * item.unit_price)
    }, 0) || proposal.value || 0

    // Preparar mensagem final substituindo o placeholder
    const finalMessage = emailMessage.replace('[LINK_DA_PROPOSTA]', publicUrl || `${supabaseUrl}/proposta/${proposal.public_hash}`)

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
        html: finalMessage.replace(/\n/g, '<br>')
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
