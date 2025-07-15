import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
    contact?: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id: number;
    };
  };
}

interface UserSession {
  step: string;
  data: {
    clientName?: string;
    clientEmail?: string;
    projectTitle?: string;
    serviceDescription?: string;
    detailedDescription?: string;
    value?: string;
    deliveryTime?: string;
    observations?: string;
  };
  phone?: string;
  userId?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  console.log(`📤 Enviando mensagem para chat ${chatId}:`, text);

  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: replyMarkup,
        parse_mode: 'Markdown'
      }),
    });

    const responseData = await response.json();
    console.log('✅ Resposta do Telegram:', responseData);

    if (!response.ok) {
      console.error('❌ Erro ao enviar mensagem Telegram:', responseData);
    }
  } catch (error) {
    console.error('❌ Erro na requisição para Telegram:', error);
  }
}

// Função para carregar sessão do banco de dados
async function loadSession(telegramUserId: number, chatId: number): Promise<UserSession> {
  console.log(`🔍 Carregando sessão para usuário ${telegramUserId}, chat ${chatId}`);

  try {
    const { data: sessionData, error } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .eq('chat_id', chatId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Erro ao carregar sessão:', error);
    }

    if (sessionData) {
      console.log('✅ Sessão encontrada:', sessionData);

      // Verificar se a sessão não expirou
      if (new Date(sessionData.expires_at) > new Date()) {
        const loadedSession = {
          step: sessionData.step,
          data: sessionData.session_data || {},
          phone: sessionData.phone,
          userId: sessionData.user_id
        };
        console.log('💾 Sessão carregada com sucesso:', loadedSession);
        return loadedSession;
      } else {
        console.log('⏰ Sessão expirada, removendo...');
        await supabase
          .from('telegram_sessions')
          .delete()
          .eq('telegram_user_id', telegramUserId)
          .eq('chat_id', chatId);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar sessão:', error);
  }

  // Retornar sessão padrão se não encontrou ou expirou
  console.log('🆕 Criando nova sessão padrão');
  return {
    step: 'start',
    data: {}
  };
}

// Função para salvar sessão no banco de dados
async function saveSession(telegramUserId: number, chatId: number, session: UserSession) {
  console.log(`💾 Salvando sessão para usuário ${telegramUserId}, chat ${chatId}:`, session);

  try {
    const { error } = await supabase
      .from('telegram_sessions')
      .upsert({
        telegram_user_id: telegramUserId,
        chat_id: chatId,
        step: session.step,
        session_data: session.data,
        phone: session.phone,
        user_id: session.userId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      }, {
        onConflict: 'telegram_user_id,chat_id'
      });

    if (error) {
      console.error('❌ Erro ao salvar sessão:', error);
    } else {
      console.log('✅ Sessão salva com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao salvar sessão:', error);
  }
}

// Função para limpar sessão
async function clearSession(telegramUserId: number, chatId: number) {
  console.log(`🧹 Limpando sessão para usuário ${telegramUserId}, chat ${chatId}`);

  try {
    await supabase
      .from('telegram_sessions')
      .delete()
      .eq('telegram_user_id', telegramUserId)
      .eq('chat_id', chatId);

    console.log('✅ Sessão limpa com sucesso');
  } catch (error) {
    console.error('❌ Erro ao limpar sessão:', error);
  }
}

async function findUserByPhone(phone: string) {
  console.log('🔍 Buscando usuário pelo telefone:', phone);

  const cleanPhone = phone.replace(/\D/g, '');
  console.log('📱 Telefone limpo:', cleanPhone);

  // Primeiro buscar na tabela profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, name, phone')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  console.log('🔍 Resultado da busca na tabela profiles:', { profiles, profilesError });

  if (profiles && profiles.length > 0) {
    console.log('✅ Usuário encontrado na tabela profiles:', profiles[0]);
    return {
      user_id: profiles[0].user_id,
      name: profiles[0].name || 'Usuário',
      phone: profiles[0].phone
    };
  }

  // Se não encontrar em profiles, buscar em companies como fallback
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  console.log('🔍 Resultado da busca na tabela companies:', { companies, companiesError });

  if (companies && companies.length > 0) {
    console.log('✅ Usuário encontrado na tabela companies:', companies[0]);
    return {
      user_id: companies[0].user_id,
      name: companies[0].name || 'Usuário',
      phone: companies[0].phone,
      email: companies[0].email
    };
  }

  console.log('❌ Usuário não encontrado pelo telefone');
  return null;
}

async function getRecentProposals(userId: string) {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        id,
        title,
        status,
        value,
        created_at,
        companies (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar propostas:', error);
      return [];
    }

    return proposals || [];
  } catch (error) {
    console.error('❌ Erro ao buscar propostas:', error);
    return [];
  }
}

async function createProposalForUser(session: UserSession) {
  console.log('🆕 Criando proposta para usuário:', session.userId);
  console.log('📋 Dados da sessão:', session.data);

  if (!session.userId) {
    throw new Error('Usuário não identificado');
  }

  let companyId = null;
  if (session.data.clientName) {
    console.log('🏢 Criando empresa para o cliente:', session.data.clientName);

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        user_id: session.userId,
        name: session.data.clientName,
        email: session.data.clientEmail || null,
        phone: session.phone || null
      })
      .select()
      .single();

    console.log('🏢 Resultado da criação da empresa:', { company, companyError });

    if (!companyError && company) {
      companyId = company.id;
    }
  }

  const proposalValue = session.data.value ?
    parseFloat(session.data.value.replace(/[^\d,]/g, '').replace(',', '.')) :
    null;

  console.log('📝 Dados da proposta a ser criada:', {
    user_id: session.userId,
    company_id: companyId,
    title: session.data.projectTitle || 'Proposta via Telegram',
    service_description: session.data.serviceDescription,
    detailed_description: session.data.detailedDescription,
    value: proposalValue,
    delivery_time: session.data.deliveryTime,
    observations: session.data.observations,
    template_id: 'moderno',
    status: 'rascunho'
  });

  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      user_id: session.userId,
      company_id: companyId,
      title: session.data.projectTitle || 'Proposta via Telegram',
      service_description: session.data.serviceDescription,
      detailed_description: session.data.detailedDescription,
      value: proposalValue,
      delivery_time: session.data.deliveryTime,
      observations: session.data.observations,
      template_id: 'moderno',
      status: 'rascunho'
    })
    .select()
    .single();

  console.log('📝 Resultado da criação da proposta:', { proposal, proposalError });

  if (proposalError) {
    throw proposalError;
  }

  return proposal;
}

async function storeUserChatId(userId: string, chatId: number) {
  try {
    const { error } = await supabase
      .from('telegram_bot_settings')
      .upsert({
        user_id: userId,
        chat_id: chatId
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Erro ao salvar chat_id:', error);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar chat_id:', error);
  }
}

async function handleMessage(update: TelegramUpdate) {
  console.log('🎯 === PROCESSANDO MENSAGEM ===');
  console.log('📨 Update recebido:', JSON.stringify(update, null, 2));

  const message = update.message;
  if (!message) {
    console.log('❌ Nenhuma mensagem encontrada no update');
    return;
  }

  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const text = message.text || '';

  console.log(`📱 Mensagem recebida de ${telegramUserId} (chat: ${chatId}): ${text}`);

  // Verificar se é comando /start ANTES de carregar a sessão
  if (text === '/start') {
    console.log('🔄 Comando /start recebido, reiniciando conversa');
    // Limpar sessão anterior
    await clearSession(telegramUserId, chatId);

    // Criar nova sessão
    const session: UserSession = {
      step: 'start',
      data: {}
    };

    const keyboard = {
      keyboard: [[{
        text: "📱 Compartilhar Telefone",
        request_contact: true
      }]],
      one_time_keyboard: true,
      resize_keyboard: true
    };

    await sendTelegramMessage(chatId,
      `🤖 *Olá! Eu sou o @borafecharai_bot!*\n\n` +
      `Sou seu assistente para criação de propostas profissionais.\n\n` +
      `📲 *Funcionalidades:*\n` +
      `• Criar propostas pelo Telegram\n` +
      `• Ver status das suas propostas\n` +
      `• Receber notificações em tempo real\n\n` +
      `Para começar, preciso identificar você pelo seu telefone cadastrado no sistema.\n\n` +
      `👇 *Clique no botão abaixo para compartilhar seu telefone:*`,
      keyboard
    );

    // Salvar sessão inicial
    await saveSession(telegramUserId, chatId, session);
    console.log('✅ Sessão inicial salva após /start');
    return;
  }

  // Carregar sessão do banco de dados
  let session = await loadSession(telegramUserId, chatId);
  console.log('📊 Estado atual da sessão:', session);

  if (message.contact) {
    console.log('📞 Contato compartilhado:', message.contact);
    session.phone = message.contact.phone_number;

    const user = await findUserByPhone(session.phone);
    if (user) {
      session.userId = user.user_id;
      console.log('✅ Usuário encontrado:', user);

      // Armazenar chat_id para notificações futuras
      await storeUserChatId(user.user_id, chatId);

      const keyboard = {
        keyboard: [
          [{ text: "🆕 Criar Nova Proposta" }],
          [{ text: "📊 Ver Status das Propostas" }]
        ],
        one_time_keyboard: false,
        resize_keyboard: true
      };

      await sendTelegramMessage(chatId,
        `✅ *Telefone identificado!* Olá ${user.name}!\n\n` +
        `🤖 *Bem-vindo ao @borafecharai_bot!*\n\n` +
        `🚀 O que você gostaria de fazer?`,
        keyboard
      );
      
      session.step = 'main_menu';
      // CRÍTICO: Salvar sessão IMEDIATAMENTE após autenticação
      await saveSession(telegramUserId, chatId, session);
      console.log('✅ Sessão salva após autenticação bem-sucedida');
      return;
    } else {
      console.log('❌ Usuário não encontrado pelo telefone:', session.phone);
      await sendTelegramMessage(chatId,
        `❌ *Telefone não encontrado na nossa base de dados.*\n\n` +
        `Para usar este bot, você precisa:\n` +
        `1. Ter uma conta no sistema Bora Fechar Aí\n` +
        `2. Ter cadastrado seu telefone no perfil do usuário\n\n` +
        `📱 Telefone pesquisado: ${session.phone}\n\n` +
        `💡 Acesse o sistema e verifique se seu telefone está correto em seu perfil.\n\n` +
        `Digite /start para tentar novamente.`
      );
      await clearSession(telegramUserId, chatId);
      return;
    }
  }

  // Verificar se usuário está autenticado para outras operações
  if (!session.userId && session.step !== 'start') {
    console.log('❌ Usuário não autenticado, redirecionando para start');
    session.step = 'start';
    await saveSession(telegramUserId, chatId, session);
    
    await sendTelegramMessage(chatId,
      `❌ *Sessão expirada ou inválida.*\n\n` +
      `Por favor, digite /start para começar novamente.`
    );
    return;
  }

  switch (session.step) {
    case 'start':
      console.log('ℹ️ Usuário na tela inicial, esperando compartilhamento de telefone');
      await sendTelegramMessage(chatId,
        `📱 *Para continuar, preciso que você compartilhe seu telefone.*\n\n` +
        `Clique no botão "📱 Compartilhar Telefone" abaixo ou digite /start para ver as opções novamente.`
      );
      break;

    case 'main_menu':
      if (text === '🆕 Criar Nova Proposta') {
        session.step = 'client_name';
        session.data = {}; // Reset proposal data
        await sendTelegramMessage(chatId,
          `🆕 *Vamos criar uma nova proposta!*\n\n*Para qual cliente você quer criar uma proposta?*\n` +
          `Digite o nome da empresa ou cliente:`
        );
      } else if (text === '📊 Ver Status das Propostas') {
        const proposals = await getRecentProposals(session.userId!);

        if (proposals.length === 0) {
          await sendTelegramMessage(chatId,
            `📊 *Status das Propostas*\n\n` +
            `❌ Você ainda não tem propostas cadastradas.\n\n` +
            `💡 Que tal criar sua primeira proposta?`
          );
        } else {
          let statusMessage = `📊 *Suas últimas ${proposals.length} propostas:*\n\n`;

          proposals.forEach((proposal, index) => {
            const statusEmoji = {
              'rascunho': '📝',
              'enviada': '📤',
              'visualizada': '👁️',
              'aceita': '✅',
              'rejeitada': '❌'
            };

            const value = proposal.value ? `R$ ${proposal.value.toLocaleString('pt-BR')}` : 'Valor não definido';
            const client = proposal.companies?.name || 'Cliente não informado';
            const status = proposal.status || 'rascunho';

            statusMessage += `${index + 1}. *${proposal.title}*\n`;
            statusMessage += `   👤 Cliente: ${client}\n`;
            statusMessage += `   💰 Valor: ${value}\n`;
            statusMessage += `   ${statusEmoji[status]} Status: ${status.charAt(0).toUpperCase() + status.slice(1)}\n\n`;
          });

          await sendTelegramMessage(chatId, statusMessage);
        }
      } else {
        await sendTelegramMessage(chatId,
          `❓ *Não entendi sua mensagem.*\n\n` +
          `🤖 Use os botões do menu ou digite /start para começar novamente.`
        );
      }
      break;

    case 'client_name':
      if (!text.trim()) {
        await sendTelegramMessage(chatId,
          `❌ *Nome do cliente não pode estar vazio.*\n\nPor favor, digite o nome da empresa ou cliente:`
        );
        return;
      }

      console.log('📝 Coletando nome do cliente:', text);
      session.data.clientName = text.trim();
      session.step = 'client_email';
      await sendTelegramMessage(chatId,
        `✅ Cliente: *${text}*\n\n*Qual o e-mail do cliente?*\n(opcional - digite "pular" para pular)`
      );
      break;

    case 'client_email':
      console.log('📧 Coletando email do cliente:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text.trim())) {
          await sendTelegramMessage(chatId,
            `❌ *E-mail inválido.* Por favor, digite um e-mail válido ou "pular" para pular:`
          );
          return;
        }
        session.data.clientEmail = text.trim();
      }
      session.step = 'project_title';
      await sendTelegramMessage(chatId,
        `${text.toLowerCase().trim() !== 'pular' ? '✅ E-mail: *' + text + '*' : '⏭️ E-mail pulado'}\n\n*Qual é o título do projeto/proposta?*\nEx: "Desenvolvimento de Website Institucional"`
      );
      break;

    case 'project_title':
      if (!text.trim()) {
        await sendTelegramMessage(chatId,
          `❌ *Título não pode estar vazio.*\n\nPor favor, digite o título do projeto:`
        );
        return;
      }

      console.log('📝 Coletando título do projeto:', text);
      session.data.projectTitle = text.trim();
      session.step = 'service_description';
      await sendTelegramMessage(chatId,
        `✅ Título: *${text}*\n\n*Faça um resumo do serviço:*\nEx: "Criação de website responsivo com CMS"`
      );
      break;

    case 'service_description':
      if (!text.trim()) {
        await sendTelegramMessage(chatId,
          `❌ *Descrição não pode estar vazia.*\n\nPor favor, faça um resumo do serviço:`
        );
        return;
      }

      console.log('📝 Coletando descrição do serviço:', text);
      session.data.serviceDescription = text.trim();
      session.step = 'detailed_description';
      await sendTelegramMessage(chatId,
        `✅ Resumo salvo!\n\n*Agora faça uma descrição mais detalhada do que será entregue:*\n\n💡 Seja específico sobre o que o cliente receberá.`
      );
      break;

    case 'detailed_description':
      if (!text.trim()) {
        await sendTelegramMessage(chatId,
          `❌ *Descrição detalhada não pode estar vazia.*\n\nPor favor, descreva o que será entregue:`
        );
        return;
      }

      console.log('📝 Coletando descrição detalhada:', text);
      session.data.detailedDescription = text.trim();
      session.step = 'value';
      await sendTelegramMessage(chatId,
        `✅ Descrição detalhada salva!\n\n*Qual o valor da proposta?*\nEx: "R$ 5.000,00" ou "5000" (ou digite "pular" para definir depois)`
      );
      break;

    case 'value':
      console.log('💰 Coletando valor:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        const numericValue = text.replace(/[^\d,]/g, '').replace(',', '.');
        if (!numericValue || isNaN(parseFloat(numericValue))) {
          await sendTelegramMessage(chatId,
            `❌ *Valor inválido.* Por favor, digite um valor numérico (ex: 5000 ou R$ 5.000,00) ou "pular":`
          );
          return;
        }
        session.data.value = text.trim();
      }
      session.step = 'delivery_time';
      await sendTelegramMessage(chatId,
        `${text.toLowerCase().trim() !== 'pular' ? '✅ Valor: *' + text + '*' : '⏭️ Valor para definir depois'}\n\n*Qual o prazo de entrega?*\nEx: "30 dias" ou "2 semanas" (ou digite "pular")`
      );
      break;

    case 'delivery_time':
      console.log('⏰ Coletando prazo:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        session.data.deliveryTime = text.trim();
      }
      session.step = 'observations';
      await sendTelegramMessage(chatId,
        `${text.toLowerCase().trim() !== 'pular' ? '✅ Prazo: *' + text + '*' : '⏭️ Prazo para definir depois'}\n\n*Alguma observação adicional?*\nEx: Condições de pagamento, garantias, etc.\n\n(ou digite "pular" para finalizar)`
      );
      break;

    case 'observations':
      console.log('📝 Coletando observações:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        session.data.observations = text.trim();
      }

      try {
        console.log('🚀 Iniciando criação da proposta...');
        await sendTelegramMessage(chatId,
          `🎯 *Gerando sua proposta...*\n\n⏳ Por favor aguarde, estou processando suas informações...`
        );

        const proposal = await createProposalForUser(session);

        console.log('✅ Proposta criada com sucesso:', proposal);

        // Resumo da proposta criada
        let summary = `🎉 *Proposta criada com sucesso!*\n\n`;
        summary += `📝 *Título:* ${session.data.projectTitle}\n`;
        summary += `👤 *Cliente:* ${session.data.clientName}\n`;
        if (session.data.clientEmail) {
          summary += `📧 *E-mail:* ${session.data.clientEmail}\n`;
        }
        if (session.data.value) {
          summary += `💰 *Valor:* ${session.data.value}\n`;
        }
        if (session.data.deliveryTime) {
          summary += `⏰ *Prazo:* ${session.data.deliveryTime}\n`;
        }
        summary += `\n✅ A proposta foi salva como rascunho na sua conta.\n\n`;
        summary += `🌐 *Próximos passos:*\n`;
        summary += `1. Acesse o sistema para revisar\n`;
        summary += `2. Envie a proposta para o cliente\n`;
        summary += `3. Acompanhe o status aqui no Telegram\n\n`;

        const keyboard = {
          keyboard: [
            [{ text: "🆕 Criar Nova Proposta" }],
            [{ text: "📊 Ver Status das Propostas" }]
          ],
          one_time_keyboard: false,
          resize_keyboard: true
        };

        await sendTelegramMessage(chatId, summary, keyboard);

        // Voltar ao menu principal
        session.step = 'main_menu';
        session.data = {};

      } catch (error) {
        console.error('❌ Erro ao criar proposta:', error);
        await sendTelegramMessage(chatId,
          `❌ *Erro ao criar proposta*\n\n` +
          `Ocorreu um erro interno: ${error.message}\n\n` +
          `🔄 Tente novamente digitando /start ou use o sistema web diretamente.\n\n` +
          `💬 Se o problema persistir, entre em contato com o suporte.`
        );
        await clearSession(telegramUserId, chatId);
        return;
      }
      break;

    default:
      console.log('❓ Comando não reconhecido, orientando usuário...');
      await sendTelegramMessage(chatId,
        `❓ *Não entendi sua mensagem.*\n\n` +
        `🤖 Para começar uma nova conversa, digite /start\n\n` +
        `💡 *Comandos disponíveis:*\n` +
        `• /start - Iniciar ou reiniciar conversa\n` +
        `• Compartilhar telefone - Para identificação`
      );
      break;
  }

  // Salvar sessão após cada interação
  await saveSession(telegramUserId, chatId, session);
  console.log('💾 Sessão salva após interação:', session);
}

serve(async (req) => {
  console.log('🔥 === WEBHOOK TELEGRAM CHAMADO ===');
  console.log('📍 Método:', req.method);
  console.log('🌐 URL:', req.url);
  console.log('📋 Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('✅ Requisição OPTIONS (CORS preflight)');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const body = await req.text();
      console.log('📨 Body bruto recebido:', body);

      const update: TelegramUpdate = JSON.parse(body);
      console.log('📱 Update parseado:', JSON.stringify(update, null, 2));

      await handleMessage(update);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('👋 Requisição GET recebida - webhook está ativo');
    return new Response('🤖 @borafecharai_bot webhook ativo e funcionando!', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('💥 === ERRO NO WEBHOOK ===');
    console.error('❌ Erro:', error);
    console.error('📊 Stack:', error.stack);

    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
