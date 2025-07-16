
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verificar se o usuário está autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verificar se é admin
    const isAdminEmail = currentUser.email === 'admin@borafecharai.com'
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('role', 'admin')
      .single()
    
    const isAdmin = isAdminEmail || adminRole

    // Obter parâmetros do body para usuário específico (se admin) ou usar o usuário atual
    const body = req.method === 'POST' ? await req.json() : {}
    const targetUserId = (isAdmin && body.userId) ? body.userId : currentUser.id

    console.log('Resetando trial para usuário:', targetUserId)

    const now = new Date()
    const trialStartDate = now.toISOString()
    const trialEndDate = new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000)).toISOString() // Exatamente 15 dias

    console.log('Data de início do trial:', trialStartDate)
    console.log('Data de fim do trial:', trialEndDate)

    // Primeiro verificar se o subscriber existe
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (!existingSubscriber) {
      console.log('Subscriber não existe, criando novo...')
      
      // Criar novo subscriber se não existir
      const { data, error } = await supabase
        .from('subscribers')
        .insert({
          user_id: targetUserId,
          email: currentUser.email,
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate,
          trial_proposals_used: 0,
          subscribed: false,
          subscription_tier: null,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()

      if (error) {
        console.error('Erro ao criar subscriber:', error)
        return new Response(JSON.stringify({ error: 'Failed to create trial' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Subscriber criado com sucesso:', data)
    } else {
      console.log('Subscriber existe, atualizando...')
      
      // Atualizar subscriber existente
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate,
          trial_proposals_used: 0,
          subscribed: false,
          subscription_tier: null,
          updated_at: now.toISOString()
        })
        .eq('user_id', targetUserId)
        .select()

      if (error) {
        console.error('Erro ao atualizar subscriber:', error)
        return new Response(JSON.stringify({ error: 'Failed to reset trial' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Subscriber atualizado com sucesso:', data)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Trial resetado com sucesso',
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
