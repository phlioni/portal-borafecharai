
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

    // Verificar role do usuário antes de aplicar regras
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId)
      .single()

    console.log('Role do usuário:', userRole?.role)

    const now = new Date()
    const trialStartDate = now.toISOString()
    const trialEndDate = new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000)).toISOString()

    console.log('Data de início do trial:', trialStartDate)
    console.log('Data de fim do trial:', trialEndDate)

    // Verificar se o subscriber já existe
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    console.log('Subscriber existente:', existingSubscriber)

    let data, error

    if (existingSubscriber) {
      // Para usuários com role 'user', sempre aplicar regras de trial se não tem assinatura ativa
      const shouldApplyTrialRules = userRole?.role === 'user' && (!existingSubscriber.subscribed || !existingSubscriber.subscription_tier)
      
      if (shouldApplyTrialRules) {
        console.log('Aplicando regras de trial para usuário com role user')
        
        // Atualizar subscriber existente com trial
        const { data: updateData, error: updateError } = await supabase
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

        data = updateData
        error = updateError
      } else {
        // Para outros casos (admin, guest, ou usuários com assinatura), apenas resetar propostas se solicitado
        const { data: updateData, error: updateError } = await supabase
          .from('subscribers')
          .update({
            trial_proposals_used: 0,
            updated_at: now.toISOString()
          })
          .eq('user_id', targetUserId)
          .select()

        data = updateData
        error = updateError
      }
    } else {
      // Criar novo subscriber
      const subscriberData = {
        user_id: targetUserId,
        email: currentUser.email,
        trial_proposals_used: 0,
        subscribed: false,
        subscription_tier: null,
        updated_at: now.toISOString()
      }

      // Para usuários com role 'user', sempre incluir dados de trial
      if (userRole?.role === 'user') {
        subscriberData.trial_start_date = trialStartDate
        subscriberData.trial_end_date = trialEndDate
        console.log('Criando subscriber com trial para usuário role user')
      } else {
        console.log('Criando subscriber sem trial para usuário não-user')
      }

      const { data: insertData, error: insertError } = await supabase
        .from('subscribers')
        .insert(subscriberData)
        .select()

      data = insertData
      error = insertError
    }

    if (error) {
      console.error('Erro ao resetar trial:', error)
      return new Response(JSON.stringify({ error: 'Failed to reset trial', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Trial resetado com sucesso:', data)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Trial resetado com sucesso',
      trialStartDate: userRole?.role === 'user' ? trialStartDate : null,
      trialEndDate: userRole?.role === 'user' ? trialEndDate : null,
      data: data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
