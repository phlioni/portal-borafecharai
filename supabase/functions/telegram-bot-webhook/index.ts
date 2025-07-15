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
    voice?: {
      duration: number;
      mime_type: string;
      file_id: string;
      file_unique_id: string;
      file_size?: number;
    };
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
  userName?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  console.log(`Enviando mensagem para chat ${chatId}:`, text);

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN não configurado');
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
    console.log('Resposta do Telegram:', responseData);

    if (!response.ok) {
      console.error('Erro ao enviar mensagem Telegram:', responseData);
    }
  } catch (error) {
    console.error('Erro na requisição para Telegram:', error);
  }
}

// Função para carregar sessão do banco de dados
async function loadSession(telegramUserId: number, chatId: number): Promise<UserSession> {
  console.log(`Carregando sessão para usuário ${telegramUserId}`);

  try {
    const { data: sessionData, error } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao carregar sessão:', error);
    }

    if (sessionData) {
      console.log('Sessão encontrada:', sessionData);

      // Verificar se a sessão não expirou
      if (new Date(sessionData.expires_at) > new Date()) {
        return {
          step: sessionData.step,
          data: sessionData.session_data || {},
          phone: sessionData.phone,
          userId: sessionData.user_id
        };
      } else {
        console.log('Sessão expirada, removendo...');
        await supabase
          .from('telegram_sessions')
          .delete()
          .eq('telegram_user_id', telegramUserId);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar sessão:', error);
  }

  // Retornar sessão padrão se não encontrou ou expirou
  console.log('Criando nova sessão padrão');
  return {
    step: 'start',
    data: {}
  };
}

// Função para salvar sessão no banco de dados
async function saveSession(telegramUserId: number, chatId: number, session: UserSession) {
  console.log(`Salvando sessão para usuário ${telegramUserId}:`, session);

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
        onConflict: 'telegram_user_id'
      });

    if (error) {
      console.error('Erro ao salvar sessão:', error);
    } else {
      console.log('Sessão salva com sucesso');
    }
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
  }
}

// Função para limpar sessão
async function clearSession(telegramUserId: number) {
  console.log(`Limpando sessão para usuário ${telegramUserId}`);

  try {
    const { error } = await supabase
      .from('telegram_sessions')
      .delete()
      .eq('telegram_user_id', telegramUserId);

    if (error) {
      console.error('Erro ao limpar sessão:', error);
    } else {
      console.log('Sessão limpa com sucesso');
    }
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
}

async function findUserByPhone(phone: string) {
  console.log('Buscando usuário pelo telefone:', phone);

  const cleanPhone = phone.replace(/\D/g, '');
  console.log('Telefone limpo:', cleanPhone);

  // Buscar primeiro na tabela profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, name, phone')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  console.log('Resultado da busca na tabela profiles:', { profiles, profileError });

  if (profiles && profiles.length > 0) {
    return {
      user_id: profiles[0].user_id,
      name: profiles[0].name,
      phone: profiles[0].phone
    };
  }

  // Se não encontrou nos profiles, buscar nas companies (fallback)
  const { data: companies, error } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  console.log('Resultado da busca na tabela companies:', { companies, error });

  if (companies && companies.length > 0) {
    return {
      user_id: companies[0].user_id,
      name: companies[0].name,
      email: companies[0].email,
      phone: companies[0].phone
    };
  }

  // Busca mais ampla se necessário
  const { data: allProfiles, error: allProfilesError } = await supabase
    .from('profiles')
    .select('user_id, name, phone');

  console.log('Buscando em todos os perfis:', { count: allProfiles?.length, error: allProfilesError });

  if (allProfiles) {
    for (const profile of allProfiles) {
      if (profile.phone) {
        const profileCleanPhone = profile.phone.replace(/\D/g, '');
        console.log(`Comparando: ${cleanPhone} com ${profileCleanPhone} (${profile.phone})`);

        if (cleanPhone === profileCleanPhone ||
            phone === profile.phone ||
            cleanPhone.includes(profileCleanPhone) ||
            profileCleanPhone.includes(cleanPhone)) {
          console.log('✅ Encontrado perfil com telefone compatível:', profile);
          return {
            user_id: profile.user_id,
            name: profile.name,
            phone: profile.phone
          };
        }
      }
    }
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
      console.error('Erro ao buscar propostas:', error);
      return [];
    }

    return proposals || [];
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return [];
  }
}

async function createProposalForUser(session: UserSession) {
  console.log('Criando proposta para usuário:', session.userId);
  console.log('Dados da sessão:', session.data);

  if (!session.userId) {
    throw new Error('Usuário não identificado');
  }

  let companyId = null;
  if (session.data.clientName) {
    console.log('Criando empresa para o cliente:', session.data.clientName);

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

    console.log('Resultado da criação da empresa:', { company, companyError });

    if (!companyError && company) {
      companyId = company.id;
    }
  }

  const proposalValue = session.data.value ?
    parseFloat(session.data.value.replace(/[^\d,]/g, '').replace(',', '.')) :
    null;

  console.log('Dados da proposta a ser criada:', {
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

  console.log('Resultado da criação da proposta:', { proposal, proposalError });

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
      console.error('Erro ao salvar chat_id:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar chat_id:', error);
  }
}

async function handleMessage(update: TelegramUpdate) {
  console.log('=== PROCESSANDO MENSAGEM ===');
  console.log('Update recebido:', JSON.stringify(update, null, 2));

  const message = update.message;
  if (!message) {
    console.log('Nenhuma mensagem encontrada no update');
    return;
  }

  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const text = message.text || '';

  console.log(`Mensagem recebida de ${telegramUserId} (chat: ${chatId}): ${text}`);

  // Carregar sessão do banco de dados
  let session = await loadSession(telegramUserId, chatId);

  // Verificar se é comando /start
  if (text === '/start') {
    console.log('Comando /start recebido, reiniciando conversa');
    // Limpar sessão anterior
    await clearSession(telegramUserId);

    // Criar nova sessão
    session = {
      step: 'start',
      data: {}
    };
  }

  console.log('Estado atual da sessão:', session);

  if (message.contact) {
    console.log('Contato compartilhado:', message.contact);
    session.phone = message.contact.phone_number;

    const user = await findUserByPhone(session.phone);
    if (user) {
      session.userId = user.user_id;
      session.userName = user.name;
      console.log('Usuário encontrado:', user);

      // Armazenar chat_id para notificações futuras
      await storeUserChatId(user.user_id, chatId);

      const businessInfo = session.userName ? 
        `Olá ${session.userName}!` : 
        `Usuário identificado!`;

      const keyboard = {
        keyboard: [
          [{ text: "🆕 Criar Nova Proposta" }],
          [{ text: "📊 Ver Status das Propostas" }]
        ],
        one_time_keyboard: false,
        resize_keyboard: true
      };

      await sendTelegramMessage(chatId,
        `✅ *Telefone identificado!* ${businessInfo}\n\n` +
        `🤖 *Bem-vindo ao @borafecharai_bot!*\n\n` +
        `🚀 O que você gostaria de fazer?`,
        keyboard
      );
      session.step = 'main_menu';
    } else {
      console.log('Usuário não encontrado pelo telefone:', session.phone);
      await sendTelegramMessage(chatId,
        `❌ *Telefone não encontrado na nossa base de dados.*\n\n` +
        `Para usar este bot, você precisa:\n` +
        `1. Ter uma conta no sistema Bora Fechar Aí\n` +
        `2. Cadastrar seu telefone em "Configurações > Perfil"\n\n` +
        `📱 Telefone pesquisado: ${session.phone}\n\n` +
        `💡 Acesse o sistema e verifique se seu telefone está correto em suas configurações.\n\n` +
        `Digite /start para tentar novamente.`
      );
      await clearSession(telegramUserId);
      return;
    }

    // Salvar sessão após autenticação
    await saveSession(telegramUserId, chatId, session);
    return;
  }

  switch (session.step) {
    case 'start':
      console.log('Processando comando /start');
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
      break;

    case 'main_menu':
      if (text === '🆕 Criar Nova Proposta') {
        session.step = 'describe_project';
        session.data = {}; // Reset proposal data
        await sendTelegramMessage(chatId,
          `🆕 *Vamos criar uma nova proposta!*\n\n` +
          `📝 *Descreva em texto ou áudio todas as informações possíveis para a proposta:*\n\n` +
          `💡 *Inclua o máximo de detalhes:*\n` +
          `• Nome do cliente/empresa\n` +
          `• Tipo de serviço/projeto\n` +
          `• Valor estimado\n` +
          `• Prazo de entrega\n` +
          `• Qualquer observação especial\n\n` +
          `Quanto mais informações você fornecer, melhor será a proposta gerada pela IA!`
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

    case 'describe_project':
      if (!text.trim() && !message.voice) {
        await sendTelegramMessage(chatId,
          `❌ *Descrição não pode estar vazia.*\n\n` +
          `Por favor, descreva seu projeto em texto ou áudio:`
        );
        return;
      }

      console.log('Processando descrição do projeto com IA:', text);
      
      try {
        // Usar IA para processar a descrição e gerar proposta
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('chat-proposal', {
          body: {
            messages: [
              { role: 'user', content: `Analise esta descrição de projeto e gere uma proposta estruturada: ${text}` }
            ],
            action: 'generate'
          }
        });

        if (aiError) {
          throw aiError;
        }

        const proposalData = JSON.parse(aiResponse.content);
        console.log('Dados da proposta gerados pela IA:', proposalData);

        // Verificar se faltam informações essenciais
        const missingInfo = [];
        if (!proposalData.cliente) missingInfo.push('nome do cliente');
        if (!proposalData.valor) missingInfo.push('valor do projeto');
        if (!proposalData.prazo) missingInfo.push('prazo de entrega');

        if (missingInfo.length > 0) {
          await sendTelegramMessage(chatId,
            `⚠️ *Informações importantes detectadas, mas ainda faltam alguns dados:*\n\n` +
            `❌ *Dados em falta:*\n` +
            missingInfo.map(info => `• ${info}`).join('\n') + '\n\n' +
            `📝 *Por favor, forneça essas informações para finalizar a proposta.*`
          );
          return;
        }

        // Se tem todas as informações, criar a proposta
        session.data = {
          clientName: proposalData.cliente,
          clientEmail: proposalData.email,
          projectTitle: proposalData.titulo,
          serviceDescription: proposalData.servico,
          detailedDescription: proposalData.descricao,
          value: proposalData.valor,
          deliveryTime: proposalData.prazo,
          observations: proposalData.observacoes
        };

        const proposal = await createProposalForUser(session);
        console.log('Proposta criada com sucesso:', proposal);

        // Resumo da proposta criada
        let summary = `🎉 *Proposta criada com sucesso!*\n\n`;
        summary += `📝 *Título:* ${proposalData.titulo}\n`;
        summary += `👤 *Cliente:* ${proposalData.cliente}\n`;
        if (proposalData.valor) {
          summary += `💰 *Valor:* R$ ${proposalData.valor}\n`;
        }
        if (proposalData.prazo) {
          summary += `⏰ *Prazo:* ${proposalData.prazo}\n`;
        }
        summary += `\n✅ A proposta foi salva como rascunho na sua conta.\n\n`;
        
        // Verificar se tem email do cliente para oferecer envio
        if (proposalData.email) {
          summary += `📧 *Email do cliente detectado:* ${proposalData.email}\n`;
          session.step = 'offer_email_send';
          session.data.proposalId = proposal.id;
          
          const keyboard = {
            keyboard: [
              [{ text: "📧 Enviar por Email" }],
              [{ text: "🆕 Criar Nova Proposta" }, { text: "📊 Ver Status das Propostas" }]
            ],
            one_time_keyboard: false,
            resize_keyboard: true
          };
          
          summary += `\n💡 *Deseja enviar esta proposta por email agora?*`;
          await sendTelegramMessage(chatId, summary, keyboard);
        } else {
          // Perguntar se quer enviar por email
          session.step = 'ask_client_email';
          session.data.proposalId = proposal.id;
          
          const keyboard = {
            keyboard: [
              [{ text: "📧 Enviar por Email" }],
              [{ text: "🆕 Criar Nova Proposta" }, { text: "📊 Ver Status das Propostas" }]
            ],
            one_time_keyboard: false,
            resize_keyboard: true
          };
          
          summary += `\n💡 *Deseja enviar esta proposta por email para o cliente?*`;
          await sendTelegramMessage(chatId, summary, keyboard);
        }

      } catch (error) {
        console.error('Erro ao processar com IA:', error);
        await sendTelegramMessage(chatId,
          `❌ *Erro ao processar proposta*\n\n` +
          `Ocorreu um erro interno. Tente novamente com uma descrição mais detalhada.\n\n` +
          `🔄 Digite /start para começar novamente.`
        );
        await clearSession(telegramUserId);
        return;
      }
      break;

    case 'ask_client_email':
      if (text === '📧 Enviar por Email') {
        await sendTelegramMessage(chatId,
          `📧 *Para enviar a proposta por email*\n\n` +
          `Por favor, digite o email do cliente:`
        );
        session.step = 'get_client_email';
      } else if (text === '🆕 Criar Nova Proposta' || text === '📊 Ver Status das Propostas') {
        // Voltar ao menu principal
        session.step = 'main_menu';
        await handleMessage({ ...update, message: { ...message, text } });
        return;
      }
      break;

    case 'get_client_email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text.trim())) {
        await sendTelegramMessage(chatId,
          `❌ *Email inválido.*\n\n` +
          `Por favor, digite um email válido:`
        );
        return;
      }
      
      session.data.clientEmail = text.trim();
      // Proceder com envio do email
      await sendProposalEmail(session.data.proposalId, session.data.clientEmail, chatId);
      session.step = 'main_menu';
      break;

    case 'offer_email_send':
      if (text === '📧 Enviar por Email') {
        // Enviar para o email já detectado
        await sendProposalEmail(session.data.proposalId, session.data.clientEmail, chatId);
        session.step = 'main_menu';
      } else if (text === '🆕 Criar Nova Proposta' || text === '📊 Ver Status das Propostas') {
        // Voltar ao menu principal
        session.step = 'main_menu';
        await handleMessage({ ...update, message: { ...message, text } });
        return;
      }
      break;

    default:
      console.log('Comando não reconhecido, orientando usuário...');
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
  console.log('Sessão salva:', session);
}

async function sendProposalEmail(proposalId: string, clientEmail: string, chatId: number) {
  try {
    const { data, error } = await supabase.functions.invoke('send-proposal-email', {
      body: {
        proposalId: proposalId,
        recipientEmail: clientEmail
      }
    });

    if (error) {
      throw error;
    }

    await sendTelegramMessage(chatId,
      `✅ *Email enviado com sucesso!*\n\n` +
      `📧 *Para:* ${clientEmail}\n` +
      `📨 *Status:* Proposta enviada\n\n` +
      `🔔 Você receberá notificações aqui quando o cliente visualizar ou responder à proposta.`
    );

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    await sendTelegramMessage(chatId,
      `❌ *Erro ao enviar email*\n\n` +
      `Não foi possível enviar a proposta por email. Tente novamente mais tarde ou use o sistema web.`
    );
  }
}

serve(async (req) => {
  console.log('=== WEBHOOK TELEGRAM CHAMADO ===');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('Requisição OPTIONS (CORS preflight)');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const body = await req.text();
      console.log('Body bruto recebido:', body);

      const update: TelegramUpdate = JSON.parse(body);
      console.log('Update parseado:', JSON.stringify(update, null, 2));

      await handleMessage(update);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Requisição GET recebida - webhook está ativo');
    return new Response('🤖 @borafecharai_bot webhook ativo e funcionando!', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('=== ERRO NO WEBHOOK ===');
    console.error('Erro:', error);
    console.error('Stack:', error.stack);

    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
