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

    // Verificar se é admin (só admin pode corrigir trial de outros usuários)
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
    const targetUserEmail = (isAdmin && body.userEmail) ? body.userEmail : currentUser.email

    console.log('Iniciando/corrigindo trial para usuário:', targetUserId, targetUserEmail)

    // Verificar se o subscriber já existe
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 15)

    if (existingSubscriber) {
      // Atualizar subscriber existente com trial
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_proposals_used: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId)
        .select()

      if (error) {
        console.error('Erro ao atualizar trial:', error)
        return new Response(JSON.stringify({ error: 'Failed to update trial' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Trial atualizado:', data)
    } else {
      // Criar novo subscriber com trial
      const { data, error } = await supabase
        .from('subscribers')
        .insert({
          user_id: targetUserId,
          email: targetUserEmail!,
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_proposals_used: 0,
          subscribed: false,
          subscription_tier: null,
        })
        .select()

      if (error) {
        console.error('Erro ao criar trial:', error)
        return new Response(JSON.stringify({ error: 'Failed to create trial' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Trial criado:', data)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Trial iniciado/corrigido com sucesso',
      trialEndDate: trialEndDate.toISOString()
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