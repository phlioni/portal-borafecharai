
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
      console.error('get-users: No authorization header provided')
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const jwt = authHeader.replace('Bearer ', '')
    console.log('get-users: Validating user token...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      console.error('get-users: Invalid user token:', userError?.message)
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('get-users: User authenticated:', user.email)

    // Verificar se é admin - primeiro checar email direto
    let isAdmin = user.email === 'admin@borafecharai.com'
    
    if (!isAdmin) {
      console.log('get-users: Checking admin role in user_roles table...')
      // Verificar role de admin na tabela user_roles usando service key
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single()
      
      if (rolesError) {
        console.error('get-users: Error checking user roles:', rolesError.message)
      }
      
      isAdmin = !!userRoles
    }
    
    if (!isAdmin) {
      console.error('get-users: User is not admin:', user.email)
      return new Response(JSON.stringify({ error: 'Access denied - Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('get-users: Admin access confirmed, fetching users...')

    // Buscar todos os usuários usando o service key
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('get-users: Error fetching users:', error.message)
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('get-users: Successfully fetched', users.users.length, 'users')

    // Retornar os dados necessários incluindo created_at
    const userData = users.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      raw_user_meta_data: user.user_metadata
    }))

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('get-users: Unexpected error:', error.message)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
