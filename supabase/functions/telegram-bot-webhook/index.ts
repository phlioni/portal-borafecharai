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

// Armazenar sessões em memória
const userSessions = new Map<number, UserSession>();

// Criar tabela em memória para armazenar chat_ids dos usuários
const userChatIds = new Map<string, number>();

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

async function findUserByPhone(phone: string) {
  console.log('Buscando usuário pelo telefone:', phone);
  
  const cleanPhone = phone.replace(/\D/g, '');
  console.log('Telefone limpo:', cleanPhone);
  
  const { data: companies, error } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  console.log('Resultado da busca na tabela companies:', { companies, error });

  if (companies && companies.length > 0) {
    return companies[0];
  }

  const { data: allCompanies, error: allError } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code');

  console.log('Buscando em todas as empresas:', { count: allCompanies?.length, error: allError });

  if (allCompanies) {
    for (const company of allCompanies) {
      if (company.phone) {
        const companyCleanPhone = company.phone.replace(/\D/g, '');
        console.log(`Comparando: ${cleanPhone} com ${companyCleanPhone} (${company.phone})`);
        
        const fullPhoneWithCountry = `${company.country_code || '+55'}${companyCleanPhone}`;
        const userPhoneWithCountry = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
        
        console.log(`Comparando com código do país: ${userPhoneWithCountry} com ${fullPhoneWithCountry}`);
        
        if (cleanPhone === companyCleanPhone || 
            userPhoneWithCountry === fullPhoneWithCountry ||
            phone === fullPhoneWithCountry ||
            cleanPhone === fullPhoneWithCountry.replace(/\D/g, '')) {
          console.log('✅ Encontrada empresa com telefone compatível:', company);
          return company;
        }
      }
    }
  }

  console.log('❌ Usuário não encontrado pelo telefone');
  return null;
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
  const userId = message.from.id;
  const text = message.text || '';

  console.log(`Mensagem recebida de ${userId} (chat: ${chatId}): ${text}`);

  // Verificar se é comando /start
  if (text === '/start') {
    console.log('Comando /start recebido, reiniciando conversa');
    // Limpar sessão anterior
    userSessions.delete(userId);
    
    // Criar nova sessão
    userSessions.set(userId, {
      step: 'start',
      data: {}
    });
  }

  if (!userSessions.has(userId)) {
    console.log('Criando nova sessão para usuário:', userId);
    userSessions.set(userId, {
      step: 'start',
      data: {}
    });
  }

  const session = userSessions.get(userId)!;
  console.log('Estado atual da sessão:', session);

  if (message.contact) {
    console.log('Contato compartilhado:', message.contact);
    session.phone = message.contact.phone_number;
    
    const user = await findUserByPhone(session.phone);
    if (user) {
      session.userId = user.user_id;
      console.log('Usuário encontrado:', user);
      
      // Armazenar chat_id para notificações futuras
      await storeUserChatId(user.user_id, chatId);
      
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.user_id)
        .single();
      
      console.log('Dados da empresa:', companyData);
      
      const businessInfo = companyData ? 
        `Empresa: ${companyData.name}\nSetor: ${companyData.description || 'Não informado'}` : 
        `Usuário: ${user.name}`;
      
      await sendTelegramMessage(chatId, 
        `✅ *Telefone identificado!* Olá ${user.name}!\n\n` +
        `📋 ${businessInfo}\n\n` +
        `🤖 *Bem-vindo ao @borafecharai_bot!*\n\n` +
        `🚀 Posso te ajudar a:\n` +
        `• Criar propostas profissionais\n` +
        `• Enviar notificações sobre suas propostas\n` +
        `• Acompanhar status das propostas\n\n` +
        `*Para qual cliente você quer criar uma proposta?*\n` +
        `Digite o nome da empresa ou cliente:`
      );
      session.step = 'client_name';
    } else {
      console.log('Usuário não encontrado pelo telefone:', session.phone);
      await sendTelegramMessage(chatId, 
        `❌ *Telefone não encontrado na nossa base de dados.*\n\n` +
        `Para usar este bot, você precisa:\n` +
        `1. Ter uma conta no sistema Bora Fechar Aí\n` +
        `2. Cadastrar seu telefone em "Configurações > Meu Negócio"\n\n` +
        `📱 Telefone pesquisado: ${session.phone}\n\n` +
        `💡 Acesse o sistema e verifique se seu telefone está correto em suas configurações.\n\n` +
        `Digite /start para tentar novamente.`
      );
      userSessions.delete(userId);
    }
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
        `• Receber notificações em tempo real\n` +
        `• Acompanhar status das propostas\n\n` +
        `Para começar, preciso identificar você pelo seu telefone cadastrado no sistema.\n\n` +
        `👇 *Clique no botão abaixo para compartilhar seu telefone:*`,
        keyboard
      );
      break;

    case 'client_name':
      if (!text.trim()) {
        await sendTelegramMessage(chatId, 
          `❌ *Nome do cliente não pode estar vazio.*\n\nPor favor, digite o nome da empresa ou cliente:`
        );
        return;
      }
      
      console.log('Coletando nome do cliente:', text);
      session.data.clientName = text.trim();
      session.step = 'client_email';
      await sendTelegramMessage(chatId, 
        `✅ Cliente: *${text}*\n\n*Qual o e-mail do cliente?*\n(opcional - digite "pular" para pular)`
      );
      break;

    case 'client_email':
      console.log('Coletando email do cliente:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        // Validar email básico
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
      
      console.log('Coletando título do projeto:', text);
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
      
      console.log('Coletando descrição do serviço:', text);
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
      
      console.log('Coletando descrição detalhada:', text);
      session.data.detailedDescription = text.trim();
      session.step = 'value';
      await sendTelegramMessage(chatId, 
        `✅ Descrição detalhada salva!\n\n*Qual o valor da proposta?*\nEx: "R$ 5.000,00" ou "5000" (ou digite "pular" para definir depois)`
      );
      break;

    case 'value':
      console.log('Coletando valor:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        // Validar se é um número válido
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
      console.log('Coletando prazo:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        session.data.deliveryTime = text.trim();
      }
      session.step = 'observations';
      await sendTelegramMessage(chatId, 
        `${text.toLowerCase().trim() !== 'pular' ? '✅ Prazo: *' + text + '*' : '⏭️ Prazo para definir depois'}\n\n*Alguma observação adicional?*\nEx: Condições de pagamento, garantias, etc.\n\n(ou digite "pular" para finalizar)`
      );
      break;

    case 'observations':
      console.log('Coletando observações:', text);
      if (text.toLowerCase().trim() !== 'pular') {
        session.data.observations = text.trim();
      }
      
      try {
        console.log('Iniciando criação da proposta...');
        await sendTelegramMessage(chatId, 
          `🎯 *Gerando sua proposta...*\n\n⏳ Por favor aguarde, estou processando suas informações...`
        );

        const proposal = await createProposalForUser(session);
        
        console.log('Proposta criada com sucesso:', proposal);
        
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
        summary += `🔄 Para criar outra proposta, digite /start novamente.`;
        
        await sendTelegramMessage(chatId, summary);

        userSessions.delete(userId);
        
      } catch (error) {
        console.error('Erro ao criar proposta:', error);
        await sendTelegramMessage(chatId, 
          `❌ *Erro ao criar proposta*\n\n` +
          `Ocorreu um erro interno: ${error.message}\n\n` +
          `🔄 Tente novamente digitando /start ou use o sistema web diretamente.\n\n` +
          `💬 Se o problema persistir, entre em contato com o suporte.`
        );
        userSessions.delete(userId);
      }
      break;

    default:
      console.log('Comando não reconhecido, orientando usuário...');
      await sendTelegramMessage(chatId, 
        `❓ *Não entendi sua mensagem.*\n\n` +
        `🤖 Para começar uma nova conversa, digite /start\n\n` +
        `💡 *Comandos disponíveis:*\n` +
        `• /start - Iniciar criação de proposta\n` +
        `• Compartilhar telefone - Para identificação`
      );
      break;
  }

  console.log('Sessão atualizada:', userSessions.get(userId));
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
