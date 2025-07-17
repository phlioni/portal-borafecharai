
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Função para validar e converter data do formato DD/MM/YYYY para YYYY-MM-DD
function convertDateToISO(dateString: string): string | null {
  if (!dateString) return null;
  
  // Verificar se está no formato DD/MM/YYYY
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return null;
  
  const [, day, month, year] = match;
  
  // Validar ranges básicos
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31) return null;
  if (monthNum < 1 || monthNum > 12) return null;
  if (yearNum < 1900 || yearNum > 2100) return null;
  
  // Converter para formato ISO (YYYY-MM-DD)
  return `${year}-${month}-${day}`;
}

const handleStartCommand = async (chatId: number, telegramUserId: number) => {
  // Limpar sessão anterior se existir
  await supabase
    .from('telegram_sessions')
    .delete()
    .eq('telegram_user_id', telegramUserId);

  // Criar nova sessão
  const { data: session, error } = await supabase
    .from('telegram_sessions')
    .insert([{
      chat_id: chatId,
      telegram_user_id: telegramUserId,
      step: 'awaiting_phone',
      session_data: {}
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar sessão:', error);
    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: 'Erro interno. Tente novamente.',
    };
  }

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: 'Olá! Vamos criar sua proposta comercial.\n\nPrimeiro, me informe seu telefone (apenas números):',
  };
};

const handleListProposals = async (chatId: number, telegramUserId: number) => {
  try {
    // Buscar sessão do usuário
    const { data: session } = await supabase
      .from('telegram_sessions')
      .select('user_id, user_profile')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (!session || !session.user_id) {
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Você precisa estar logado para ver suas propostas. Use /start para fazer login.',
      };
    }

    // Buscar propostas do usuário
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('id, title, status, created_at, value')
      .eq('user_id', session.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar propostas:', error);
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Erro ao buscar propostas. Tente novamente.',
      };
    }

    if (!proposals || proposals.length === 0) {
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Você ainda não possui propostas cadastradas.',
      };
    }

    let message = '📋 *Suas propostas:*\n\n';
    
    for (const proposal of proposals) {
      const statusEmoji = proposal.status === 'aceita' ? '✅' : 
                         proposal.status === 'rejeitada' ? '❌' : 
                         proposal.status === 'rascunho' ? '📝' : '📤';
      
      const value = proposal.value ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado';
      const date = new Date(proposal.created_at).toLocaleDateString('pt-BR');
      
      message += `${statusEmoji} *${proposal.title}*\n`;
      message += `💰 Valor: ${value}\n`;
      message += `📅 Data: ${date}\n`;
      message += `🔗 Link: https://pakrraqbjbkkbdnwkkbt.supabase.co/propostas/${proposal.id}\n\n`;
    }

    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    };

  } catch (error) {
    console.error('Erro ao listar propostas:', error);
    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: 'Erro interno. Tente novamente.',
    };
  }
};

const handleCreateProposal = async (chatId: number, telegramUserId: number, proposalData: any) => {
  try {
    // Buscar sessão do usuário
    const { data: session } = await supabase
      .from('telegram_sessions')
      .select('user_id')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (!session || !session.user_id) {
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Sessão expirada. Use /start para fazer login novamente.',
      };
    }

    // Converter data de validade se fornecida
    let validityDate = null;
    if (proposalData.validity_date) {
      validityDate = convertDateToISO(proposalData.validity_date);
      if (!validityDate) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'Data de validade inválida. Use o formato DD/MM/YYYY.',
        };
      }
    }

    // Criar a proposta
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert([{
        title: proposalData.title,
        service_description: proposalData.service_description,
        detailed_description: proposalData.detailed_description,
        value: proposalData.value ? parseFloat(proposalData.value) : null,
        delivery_time: proposalData.delivery_time,
        validity_date: validityDate,
        observations: proposalData.observations,
        status: 'rascunho',
        user_id: session.user_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating proposal:', error);
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: `Erro ao criar proposta: ${error.message}`,
      };
    }

    // Limpar sessão
    await supabase
      .from('telegram_sessions')
      .delete()
      .eq('telegram_user_id', telegramUserId);

    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: `✅ Proposta "${proposal.title}" criada com sucesso!\n\n🔗 Acesse: https://pakrraqbjbkkbdnwkkbt.supabase.co/propostas/${proposal.id}`,
    };

  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: 'Erro interno. Tente novamente.',
    };
  }
};

const handleNotificationRequest = async (chatId: number, telegramUserId: number) => {
  try {
    // Buscar sessão do usuário
    const { data: session } = await supabase
      .from('telegram_sessions')
      .select('user_id')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (!session || !session.user_id) {
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Você precisa estar logado para ativar notificações. Use /start para fazer login.',
      };
    }

    // Verificar se já existe configuração de bot
    const { data: existingBot } = await supabase
      .from('telegram_bot_settings')
      .select('id')
      .eq('user_id', session.user_id)
      .single();

    if (existingBot) {
      // Atualizar configuração existente
      await supabase
        .from('telegram_bot_settings')
        .update({
          chat_id: chatId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user_id);
    } else {
      // Criar nova configuração
      await supabase
        .from('telegram_bot_settings')
        .insert([{
          user_id: session.user_id,
          chat_id: chatId,
          webhook_configured: true
        }]);
    }

    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: '🔔 Notificações ativadas! Você receberá alertas quando suas propostas forem aceitas ou rejeitadas.',
    };

  } catch (error) {
    console.error('Erro ao ativar notificações:', error);
    return {
      method: 'sendMessage',
      chat_id: chatId,
      text: 'Erro ao ativar notificações. Tente novamente.',
    };
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response('No message', { status: 400 })
    }

    const chatId = message.chat.id
    const telegramUserId = message.from.id
    const text = message.text

    let response

    // Comandos básicos
    if (text === '/start') {
      response = await handleStartCommand(chatId, telegramUserId)
    } else if (text === '/propostas') {
      response = await handleListProposals(chatId, telegramUserId)
    } else if (text === '/notificacoes') {
      response = await handleNotificationRequest(chatId, telegramUserId)
    } else {
      // Processar fluxo de criação de proposta
      const { data: session } = await supabase
        .from('telegram_sessions')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .single()

      if (!session) {
        response = {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'Sessão não encontrada. Use /start para começar.',
        }
      } else {
        response = await processSession(chatId, telegramUserId, text, session)
      }
    }

    // Enviar resposta para o Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}/${response.method}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      }
    )

    if (!telegramResponse.ok) {
      console.error('Erro ao enviar mensagem para Telegram:', await telegramResponse.text())
    }

    return new Response('ok', { headers: corsHeaders })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})

async function processSession(chatId: number, telegramUserId: number, text: string, session: any) {
  const currentStep = session.step
  const sessionData = session.session_data || {}

  switch (currentStep) {
    case 'awaiting_phone':
      // Validar telefone
      const phoneRegex = /^\d{10,11}$/
      if (!phoneRegex.test(text)) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'Telefone inválido. Digite apenas números (10 ou 11 dígitos):',
        }
      }

      // Verificar se usuário existe
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const userExists = existingUser.users.find(u => u.phone === text)

      if (!userExists) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'Usuário não encontrado. Cadastre-se primeiro no sistema web.',
        }
      }

      // Atualizar sessão
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_email',
          session_data: { ...sessionData, phone: text },
          user_id: userExists.id,
          phone: text
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Agora digite seu e-mail:',
      }

    case 'awaiting_email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(text)) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'E-mail inválido. Digite um e-mail válido:',
        }
      }

      // Verificar se e-mail confere com o usuário
      const { data: userData } = await supabase.auth.admin.getUserById(session.user_id)
      if (userData.user?.email !== text) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'E-mail não confere com o cadastro. Digite o e-mail correto:',
        }
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user_id)
        .single()

      // Atualizar sessão
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'authenticated',
          session_data: { ...sessionData, email: text },
          client_email: text,
          user_profile: profile
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: `✅ Autenticado com sucesso!\n\nOlá ${profile?.name || 'usuário'}!\n\nComandos disponíveis:\n/propostas - Ver suas propostas\n/notificacoes - Ativar notificações\n\nOu digite o título da proposta que deseja criar:`,
      }

    case 'authenticated':
      // Usuário autenticado, iniciar criação de proposta
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_service_description',
          session_data: { ...sessionData, title: text }
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Agora digite um resumo do serviço:',
      }

    case 'awaiting_service_description':
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_detailed_description',
          session_data: { ...sessionData, service_description: text }
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Digite uma descrição detalhada do projeto:',
      }

    case 'awaiting_detailed_description':
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_value',
          session_data: { ...sessionData, detailed_description: text }
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Digite o valor da proposta (apenas números, sem R$):',
      }

    case 'awaiting_value':
      const valueRegex = /^\d+(\.\d{1,2})?$/
      if (!valueRegex.test(text)) {
        return {
          method: 'sendMessage',
          chat_id: chatId,
          text: 'Valor inválido. Digite apenas números (ex: 1000.50):',
        }
      }

      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_delivery_time',
          session_data: { ...sessionData, value: text }
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Digite o prazo de entrega (ex: 30 dias):',
      }

    case 'awaiting_delivery_time':
      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_validity_date',
          session_data: { ...sessionData, delivery_time: text }
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Digite a data de validade da proposta (DD/MM/YYYY) ou "pular":',
      }

    case 'awaiting_validity_date':
      let validityDate = null
      if (text.toLowerCase() !== 'pular') {
        validityDate = text
      }

      await supabase
        .from('telegram_sessions')
        .update({
          step: 'awaiting_observations',
          session_data: { ...sessionData, validity_date: validityDate }
        })
        .eq('telegram_user_id', telegramUserId)

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Digite observações adicionais ou "pular":',
      }

    case 'awaiting_observations':
      let observations = null
      if (text.toLowerCase() !== 'pular') {
        observations = text
      }

      const finalData = {
        ...sessionData,
        observations
      }

      // Criar proposta
      return await handleCreateProposal(chatId, telegramUserId, finalData)

    default:
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Comando não reconhecido. Use /start para começar.',
      }
  }
}
