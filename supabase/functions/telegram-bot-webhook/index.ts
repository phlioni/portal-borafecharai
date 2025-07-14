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
    businessType?: string;
    serviceType?: string;
    targetAudience?: string;
    tone?: string;
    template?: string;
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

// Armazenar sessões em memória (em produção, usar banco de dados)
const userSessions = new Map<number, UserSession>();

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
  
  // Limpar o telefone (remover caracteres especiais)
  const cleanPhone = phone.replace(/\D/g, '');
  console.log('Telefone limpo:', cleanPhone);
  
  // Buscar empresas/usuários pelo telefone (busca por telefone exato e também por telefone sem formatação)
  const { data: companies, error } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  console.log('Resultado da busca na tabela companies:', { companies, error });

  if (companies && companies.length > 0) {
    return companies[0];
  }

  // Se não encontrou, buscar em todas as empresas e verificar telefones formatados
  const { data: allCompanies, error: allError } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code');

  console.log('Buscando em todas as empresas:', { count: allCompanies?.length, error: allError });

  if (allCompanies) {
    for (const company of allCompanies) {
      if (company.phone) {
        const companyCleanPhone = company.phone.replace(/\D/g, '');
        console.log(`Comparando: ${cleanPhone} com ${companyCleanPhone} (${company.phone})`);
        
        // Verificar telefone com código do país
        const fullPhoneWithCountry = `${company.country_code || '+55'}${companyCleanPhone}`;
        const userPhoneWithCountry = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
        
        console.log(`Comparando com código do país: ${userPhoneWithCountry} com ${fullPhoneWithCountry}`);
        
        if (cleanPhone === companyCleanPhone || 
            userPhoneWithCountry === fullPhoneWithCountry ||
            phone === fullPhoneWithCountry ||
            cleanPhone === fullPhoneWithCountry.replace(/\D/g, '')) {
          console.log('✅ Encontrado empresa com telefone compatível:', company);
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

  // Criar empresa se necessário
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

  // Criar proposta
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
    template_id: session.data.template || 'moderno',
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
      template_id: session.data.template || 'moderno',
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

  // Inicializar sessão se não existir
  if (!userSessions.has(userId)) {
    console.log('Criando nova sessão para usuário:', userId);
    userSessions.set(userId, {
      step: 'start',
      data: {}
    });
  }

  const session = userSessions.get(userId)!;
  console.log('Estado atual da sessão:', session);

  // Processar contato compartilhado
  if (message.contact) {
    console.log('Contato compartilhado:', message.contact);
    session.phone = message.contact.phone_number;
    
    // Buscar usuário pelo telefone
    const user = await findUserByPhone(session.phone);
    if (user) {
      session.userId = user.user_id;
      console.log('Usuário encontrado:', user);
      
      // Buscar informações da empresa para personalizar a conversa
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
        `✅ Telefone identificado! Olá ${user.name}!\n\n` +
        `📋 ${businessInfo}\n\n` +
        `🚀 Vou te ajudar a criar uma proposta profissional rapidamente!\n\n` +
        `*Para qual cliente você quer criar uma proposta?*\n` +
        `Digite o nome da empresa ou cliente:`
      );
      session.step = 'client_name';
    } else {
      console.log('Usuário não encontrado pelo telefone:', session.phone);
      await sendTelegramMessage(chatId, 
        `❌ Telefone não encontrado na nossa base de dados.\n\nPara usar este bot, você precisa estar cadastrado no nosso sistema. Acesse o sistema e crie sua conta primeiro.\n\nTelefone pesquisado: ${session.phone}`
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
        `👋 Olá! Eu sou o assistente de propostas!\n\nPara começar, preciso identificar você pelo seu telefone cadastrado no sistema.\n\n👇 Clique no botão abaixo para compartilhar seu telefone:`,
        keyboard
      );
      break;

    case 'client_name':
      console.log('Coletando nome do cliente:', text);
      session.data.clientName = text;
      session.step = 'client_email';
      await sendTelegramMessage(chatId, 
        `✅ Cliente: *${text}*\n\n*Qual o e-mail do cliente?* (opcional - digite "pular" para pular)`
      );
      break;

    case 'client_email':
      console.log('Coletando email do cliente:', text);
      if (text.toLowerCase() !== 'pular') {
        session.data.clientEmail = text;
      }
      session.step = 'project_title';
      await sendTelegramMessage(chatId, 
        `${text !== 'pular' ? '✅ E-mail: *' + text + '*' : '⏭️ E-mail pulado'}\n\n*Qual é o título do projeto/proposta?*\nEx: "Desenvolvimento de Website Institucional"`
      );
      break;

    case 'project_title':
      console.log('Coletando título do projeto:', text);
      session.data.projectTitle = text;
      session.step = 'service_description';
      await sendTelegramMessage(chatId, 
        `✅ Título: *${text}*\n\n*Faça um resumo do serviço:*\nEx: "Criação de website responsivo com CMS"`
      );
      break;

    case 'service_description':
      console.log('Coletando descrição do serviço:', text);
      session.data.serviceDescription = text;
      session.step = 'detailed_description';
      await sendTelegramMessage(chatId, 
        `✅ Resumo salvo!\n\n*Agora faça uma descrição mais detalhada do que será entregue:*`
      );
      break;

    case 'detailed_description':
      console.log('Coletando descrição detalhada:', text);
      session.data.detailedDescription = text;
      session.step = 'value';
      await sendTelegramMessage(chatId, 
        `✅ Descrição salva!\n\n*Qual o valor da proposta?*\nEx: "R$ 5.000,00" (ou digite "pular" para definir depois)`
      );
      break;

    case 'value':
      console.log('Coletando valor:', text);
      if (text.toLowerCase() !== 'pular') {
        session.data.value = text;
      }
      session.step = 'delivery_time';
      await sendTelegramMessage(chatId, 
        `${text !== 'pular' ? '✅ Valor: *' + text + '*' : '⏭️ Valor para definir depois'}\n\n*Qual o prazo de entrega?*\nEx: "30 dias" (ou digite "pular")`
      );
      break;

    case 'delivery_time':
      console.log('Coletando prazo:', text);
      if (text.toLowerCase() !== 'pular') {
        session.data.deliveryTime = text;
      }
      session.step = 'observations';
      await sendTelegramMessage(chatId, 
        `${text !== 'pular' ? '✅ Prazo: *' + text + '*' : '⏭️ Prazo para definir depois'}\n\n*Alguma observação adicional?*\n(ou digite "pular" para finalizar)`
      );
      break;

    case 'observations':
      console.log('Coletando observações:', text);
      if (text.toLowerCase() !== 'pular') {
        session.data.observations = text;
      }
      
      // Gerar proposta
      try {
        console.log('Iniciando criação da proposta...');
        await sendTelegramMessage(chatId, 
          `🎯 *Gerando sua proposta...*\n\nPor favor aguarde...`
        );

        const proposal = await createProposalForUser(session);
        
        console.log('Proposta criada com sucesso:', proposal);
        
        await sendTelegramMessage(chatId, 
          `🎉 *Proposta criada com sucesso!*\n\n` +
          `📝 *Título:* ${session.data.projectTitle}\n` +
          `👤 *Cliente:* ${session.data.clientName}\n` +
          `💰 *Valor:* ${session.data.value || 'A definir'}\n` +
          `⏰ *Prazo:* ${session.data.deliveryTime || 'A definir'}\n\n` +
          `✅ A proposta foi salva como rascunho na sua conta.\n\n` +
          `🌐 Acesse o sistema para revisar e enviar a proposta!`
        );

        // Limpar sessão
        userSessions.delete(userId);
        
      } catch (error) {
        console.error('Erro ao criar proposta:', error);
        await sendTelegramMessage(chatId, 
          `❌ *Erro ao criar proposta*\n\nOcorreu um erro interno: ${error.message}\n\nTente novamente mais tarde ou use o sistema web diretamente.`
        );
        userSessions.delete(userId);
      }
      break;

    default:
      console.log('Comando não reconhecido, reiniciando...');
      await sendTelegramMessage(chatId, 
        `❓ Não entendi. Digite /start para começar novamente.`
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

    // Resposta para requisições GET (teste)
    console.log('Requisição GET recebida - webhook está ativo');
    return new Response('Bot webhook ativo e funcionando! 🤖', {
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