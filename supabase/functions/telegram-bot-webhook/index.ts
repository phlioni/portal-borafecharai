
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  message?: {
    chat: { id: number }
    from: { id: number; first_name?: string; username?: string }
    text?: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const update: TelegramUpdate = await req.json()
    const message = update.message

    if (!message?.text) {
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    const chatId = message.chat.id
    const telegramUserId = message.from.id
    const text = message.text.trim()

    console.log(`Received message from ${telegramUserId}: ${text}`)

    // Função para buscar usuário por telefone na tabela profiles
    const findUserByPhone = async (phone: string) => {
      console.log(`Searching for user with phone: ${phone}`)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          name,
          phone
        `)
        .eq('phone', phone)
        .maybeSingle()

      if (error) {
        console.error('Error searching for user by phone:', error)
        return null
      }

      console.log('Found profile:', profile)
      return profile
    }

    // Função para enviar mensagem
    const sendMessage = async (text: string) => {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      })
      
      if (!response.ok) {
        console.error('Failed to send message:', await response.text())
      }
    }

    // Buscar sessão existente
    const { data: session } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('chat_id', chatId)
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    // Comando /start ou reiniciar
    if (text === '/start' || text.toLowerCase() === 'começar') {
      await supabase
        .from('telegram_sessions')
        .delete()
        .eq('chat_id', chatId)
        .eq('telegram_user_id', telegramUserId)

      await supabase
        .from('telegram_sessions')
        .insert({
          chat_id: chatId,
          telegram_user_id: telegramUserId,
          step: 'phone_request',
          session_data: {}
        })

      await sendMessage(
        '🤖 Olá! Sou o bot do PropositAI.\n\n' +
        'Para acessar suas propostas e receber notificações, preciso validar sua identidade.\n\n' +
        '📱 Por favor, envie seu número de telefone no formato:\n' +
        '+5511999999999\n\n' +
        '(Inclua o código do país +55, DDD e número)'
      )
      
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    if (!session) {
      await sendMessage(
        'Sessão não encontrada. Digite /start para começar.'
      )
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Estado: aguardando telefone
    if (session.step === 'phone_request') {
      const phoneRegex = /^\+\d{1,3}\d{10,11}$/
      
      if (!phoneRegex.test(text)) {
        await sendMessage(
          '❌ Formato de telefone inválido.\n\n' +
          'Use o formato: +5511999999999\n' +
          '(Código do país + DDD + número)'
        )
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Buscar usuário por telefone na tabela profiles 
      const userProfile = await findUserByPhone(text)
      
      if (!userProfile) {
        await sendMessage(
          '❌ Telefone não encontrado no sistema.\n\n' +
          'Verifique se:\n' +
          '• O número está correto\n' +
          '• Você já cadastrou este telefone em seu perfil no PropositAI\n' +
          '• O formato está correto: +5511999999999\n\n' +
          'Digite um novo número ou /start para recomeçar.'
        )
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Salvar dados do usuário na sessão
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'authenticated',
          phone: text,
          user_id: userProfile.user_id,
          session_data: {
            user_name: userProfile.name,
            phone: userProfile.phone
          }
        })
        .eq('id', session.id)

      await sendMessage(
        `✅ Autenticação realizada com sucesso!\n\n` +
        `👤 Olá, ${userProfile.name || 'Usuário'}!\n\n` +
        `Agora você receberá notificações sobre suas propostas:\n` +
        `• 📬 Quando uma proposta for aceita\n` +
        `• 📬 Quando uma proposta for rejeitada\n\n` +
        `🔧 Para reconfigurar, digite /start`
      )

      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Estado: autenticado
    if (session.step === 'authenticated') {
      await sendMessage(
        `✅ Você já está autenticado!\n\n` +
        `Receberá notificações automáticas sobre suas propostas.\n\n` +
        `🔧 Para reconfigurar, digite /start`
      )
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Estado não reconhecido
    await sendMessage(
      'Estado não reconhecido. Digite /start para recomeçar.'
    )

    return new Response('OK', { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Error in telegram webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
