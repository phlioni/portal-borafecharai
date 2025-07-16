
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar todos os usuários que não têm trial configurado
    const { data: usersWithoutTrial, error: fetchError } = await supabaseClient
      .from('subscribers')
      .select('user_id, email, trial_start_date, subscribed, subscription_tier')
      .is('trial_start_date', null)
      .eq('subscribed', false)
      .is('subscription_tier', null)

    if (fetchError) {
      console.error('Erro ao buscar usuários sem trial:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Encontrados ${usersWithoutTrial?.length || 0} usuários sem trial configurado`)

    let fixedCount = 0

    if (usersWithoutTrial && usersWithoutTrial.length > 0) {
      // Corrigir cada usuário
      for (const user of usersWithoutTrial) {
        const { error: updateError } = await supabaseClient
          .from('subscribers')
          .update({
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
            trial_proposals_used: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id)

        if (updateError) {
          console.error(`Erro ao corrigir trial para usuário ${user.user_id}:`, updateError)
        } else {
          fixedCount++
          console.log(`Trial configurado para usuário ${user.user_id}`)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Trial configurado para ${fixedCount} usuários`,
        total_found: usersWithoutTrial?.length || 0,
        fixed: fixedCount
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
