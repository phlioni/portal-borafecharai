
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

    // Verificar se o usuário é admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verificar se é admin
    const isAdmin = user.email === 'admin@borafecharai.com'
    
    if (!isAdmin) {
      // Verificar role de admin na tabela user_roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single()
      
      if (!userRoles) {
        return new Response(JSON.stringify({ error: 'Access denied - Admin only' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Obter userId do body da requisição
    const { userId } = await req.json()
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Iniciando exclusão do usuário:', userId)

    // Deletar dados relacionados na ordem correta (das tabelas filhas para as pais)
    
    // 1. Primeiro, buscar IDs das propostas do usuário
    const { data: userProposals } = await supabase
      .from('proposals')
      .select('id')
      .eq('user_id', userId)
    
    const proposalIds = userProposals?.map(p => p.id) || []
    
    // 2. Deletar itens de orçamento das propostas
    if (proposalIds.length > 0) {
      const { error: budgetItemsError } = await supabase
        .from('proposal_budget_items')
        .delete()
        .in('proposal_id', proposalIds)
      
      if (budgetItemsError) {
        console.error('Erro ao deletar itens de orçamento:', budgetItemsError)
      }
    }

    // 3. Deletar notificações de propostas
    const { error: notificationsError } = await supabase
      .from('proposal_notifications')
      .delete()
      .eq('user_id', userId)
    
    if (notificationsError) {
      console.error('Erro ao deletar notificações:', notificationsError)
    }

    // 4. Deletar propostas
    const { error: proposalsError } = await supabase
      .from('proposals')
      .delete()
      .eq('user_id', userId)
    
    if (proposalsError) {
      console.error('Erro ao deletar propostas:', proposalsError)
    }

    // 5. Deletar templates personalizados
    const { error: templatesError } = await supabase
      .from('custom_proposal_templates')
      .delete()
      .eq('user_id', userId)
    
    if (templatesError) {
      console.error('Erro ao deletar templates:', templatesError)
    }

    // 6. Deletar templates de email
    const { error: emailTemplatesError } = await supabase
      .from('email_templates')
      .delete()
      .eq('user_id', userId)
    
    if (emailTemplatesError) {
      console.error('Erro ao deletar templates de email:', emailTemplatesError)
    }

    // 7. Deletar configurações do Telegram
    const { error: telegramError } = await supabase
      .from('telegram_bot_settings')
      .delete()
      .eq('user_id', userId)
    
    if (telegramError) {
      console.error('Erro ao deletar config Telegram:', telegramError)
    }

    // 8. Deletar sessões do Telegram
    const { error: sessionsError } = await supabase
      .from('telegram_sessions')
      .delete()
      .eq('user_id', userId)
    
    if (sessionsError) {
      console.error('Erro ao deletar sessões Telegram:', sessionsError)
    }

    // 9. Deletar configurações do sistema
    const { error: settingsError } = await supabase
      .from('system_settings')
      .delete()
      .eq('user_id', userId)
    
    if (settingsError) {
      console.error('Erro ao deletar configurações:', settingsError)
    }

    // 10. Deletar empresas (companies)
    const { error: companiesError } = await supabase
      .from('companies')
      .delete()
      .eq('user_id', userId)
    
    if (companiesError) {
      console.error('Erro ao deletar empresas:', companiesError)
    }

    // 11. Deletar user_companies (esta é a tabela que estava causando o erro)
    const { error: userCompaniesError } = await supabase
      .from('user_companies')
      .delete()
      .eq('user_id', userId)
    
    if (userCompaniesError) {
      console.error('Erro ao deletar user_companies:', userCompaniesError)
    }

    // 12. Deletar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId)
    
    if (profileError) {
      console.error('Erro ao deletar perfil:', profileError)
    }

    // 13. Deletar assinante
    const { error: subscriberError } = await supabase
      .from('subscribers')
      .delete()
      .eq('user_id', userId)
    
    if (subscriberError) {
      console.error('Erro ao deletar subscriber:', subscriberError)
    }

    // 14. Deletar roles do usuário
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
    
    if (rolesError) {
      console.error('Erro ao deletar roles:', rolesError)
    }

    // 15. Deletar clientes
    const { error: clientsError } = await supabase
      .from('clients')
      .delete()
      .eq('user_id', userId)
    
    if (clientsError) {
      console.error('Erro ao deletar clientes:', clientsError)
    }

    console.log('Dados relacionados deletados, deletando usuário da auth...')

    // Por último, deletar usuário usando o service key
    const { error } = await supabase.auth.admin.deleteUser(userId)
    
    if (error) {
      console.error('Erro ao excluir usuário da auth:', error)
      return new Response(JSON.stringify({ error: 'Failed to delete user from auth', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Usuário deletado com sucesso:', userId)

    return new Response(JSON.stringify({ success: true, message: 'User and related data deleted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro geral ao deletar usuário:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
