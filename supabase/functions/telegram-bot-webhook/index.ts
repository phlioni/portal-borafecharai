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

    if (!response.ok) {
      console.error('Erro ao enviar mensagem Telegram:', await response.text());
    }
  } catch (error) {
    console.error('Erro na requisição para Telegram:', error);
  }
}

async function findUserByPhone(phone: string) {
  // Buscar empresas/usuários pelo telefone
  const { data: companies, error } = await supabase
    .from('companies')
    .select('user_id, name, email, phone')
    .eq('phone', phone)
    .single();

  if (error || !companies) {
    return null;
  }

  return companies;
}

async function createProposalForUser(session: UserSession) {
  if (!session.userId) {
    throw new Error('Usuário não identificado');
  }

  // Criar empresa se necessário
  let companyId = null;
  if (session.data.clientName) {
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

    if (!companyError && company) {
      companyId = company.id;
    }
  }

  // Criar proposta
  const proposalValue = session.data.value ? 
    parseFloat(session.data.value.replace(/[^\d,]/g, '').replace(',', '.')) : 
    null;

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

  if (proposalError) {
    throw proposalError;
  }

  return proposal;
}

async function handleMessage(update: TelegramUpdate) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const userId = message.from.id;
  const text = message.text || '';

  console.log(`Mensagem recebida de ${userId}: ${text}`);

  // Inicializar sessão se não existir
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      step: 'start',
      data: {}
    });
  }

  const session = userSessions.get(userId)!;

  // Processar contato compartilhado
  if (message.contact) {
    session.phone = message.contact.phone_number;
    
    // Buscar usuário pelo telefone
    const user = await findUserByPhone(session.phone);
    if (user) {
      session.userId = user.user_id;
      await sendTelegramMessage(chatId, 
        `✅ Telefone identificado! Olá ${user.name}!\n\nAgora vou te ajudar a criar uma proposta profissional. Vamos começar?\n\n*Qual tipo de negócio você tem?*\nEx: Agência Digital, Consultoria, E-commerce, etc.`
      );
      session.step = 'business_type';
    } else {
      await sendTelegramMessage(chatId, 
        `❌ Telefone não encontrado na nossa base de dados.\n\nPara usar este bot, você precisa estar cadastrado no nosso sistema. Acesse: [Link do seu sistema] e crie sua conta primeiro.`
      );
      userSessions.delete(userId);
    }
    return;
  }

  switch (session.step) {
    case 'start':
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

    case 'business_type':
      session.data.businessType = text;
      session.step = 'service_type';
      await sendTelegramMessage(chatId, 
        `✅ Tipo de negócio: *${text}*\n\n*Que tipo de serviço você quer propor?*\nEx: Desenvolvimento de Website, Consultoria em Marketing, Design Gráfico, etc.`
      );
      break;

    case 'service_type':
      session.data.serviceType = text;
      session.step = 'target_audience';
      await sendTelegramMessage(chatId, 
        `✅ Serviço: *${text}*\n\n*Qual é o público-alvo deste projeto?*\nEx: Pequenas empresas, Startups, E-commerces, etc.`
      );
      break;

    case 'target_audience':
      session.data.targetAudience = text;
      session.step = 'tone';
      
      const toneKeyboard = {
        keyboard: [
          [{ text: "Profissional" }, { text: "Amigável" }],
          [{ text: "Técnico" }, { text: "Criativo" }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      };
      
      await sendTelegramMessage(chatId, 
        `✅ Público-alvo: *${text}*\n\n*Qual tom você quer na proposta?*`,
        toneKeyboard
      );
      break;

    case 'tone':
      session.data.tone = text;
      session.step = 'template';
      
      const templateKeyboard = {
        keyboard: [
          [{ text: "Moderno" }, { text: "Executivo" }],
          [{ text: "Criativo" }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      };
      
      await sendTelegramMessage(chatId, 
        `✅ Tom: *${text}*\n\n*Qual template você quer usar?*`,
        templateKeyboard
      );
      break;

    case 'template':
      session.data.template = text.toLowerCase();
      session.step = 'client_name';
      await sendTelegramMessage(chatId, 
        `✅ Template: *${text}*\n\n*Qual é o nome do cliente/empresa?*`
      );
      break;

    case 'client_name':
      session.data.clientName = text;
      session.step = 'client_email';
      await sendTelegramMessage(chatId, 
        `✅ Cliente: *${text}*\n\n*Qual o e-mail do cliente?* (opcional - digite "pular" para pular)`
      );
      break;

    case 'client_email':
      if (text.toLowerCase() !== 'pular') {
        session.data.clientEmail = text;
      }
      session.step = 'project_title';
      await sendTelegramMessage(chatId, 
        `${text !== 'pular' ? '✅ E-mail: *' + text + '*' : '⏭️ E-mail pulado'}\n\n*Qual é o título do projeto/proposta?*\nEx: "Desenvolvimento de Website Institucional"`
      );
      break;

    case 'project_title':
      session.data.projectTitle = text;
      session.step = 'service_description';
      await sendTelegramMessage(chatId, 
        `✅ Título: *${text}*\n\n*Faça um resumo do serviço:*\nEx: "Criação de website responsivo com CMS"`
      );
      break;

    case 'service_description':
      session.data.serviceDescription = text;
      session.step = 'detailed_description';
      await sendTelegramMessage(chatId, 
        `✅ Resumo salvo!\n\n*Agora faça uma descrição mais detalhada do que será entregue:*`
      );
      break;

    case 'detailed_description':
      session.data.detailedDescription = text;
      session.step = 'value';
      await sendTelegramMessage(chatId, 
        `✅ Descrição salva!\n\n*Qual o valor da proposta?*\nEx: "R$ 5.000,00" (ou digite "pular" para definir depois)`
      );
      break;

    case 'value':
      if (text.toLowerCase() !== 'pular') {
        session.data.value = text;
      }
      session.step = 'delivery_time';
      await sendTelegramMessage(chatId, 
        `${text !== 'pular' ? '✅ Valor: *' + text + '*' : '⏭️ Valor para definir depois'}\n\n*Qual o prazo de entrega?*\nEx: "30 dias" (ou digite "pular")`
      );
      break;

    case 'delivery_time':
      if (text.toLowerCase() !== 'pular') {
        session.data.deliveryTime = text;
      }
      session.step = 'observations';
      await sendTelegramMessage(chatId, 
        `${text !== 'pular' ? '✅ Prazo: *' + text + '*' : '⏭️ Prazo para definir depois'}\n\n*Alguma observação adicional?*\n(ou digite "pular" para finalizar)`
      );
      break;

    case 'observations':
      if (text.toLowerCase() !== 'pular') {
        session.data.observations = text;
      }
      
      // Gerar proposta
      try {
        await sendTelegramMessage(chatId, 
          `🎯 *Gerando sua proposta...*\n\nPor favor aguarde...`
        );

        const proposal = await createProposalForUser(session);
        
        await sendTelegramMessage(chatId, 
          `🎉 *Proposta criada com sucesso!*\n\n` +
          `📝 *Título:* ${session.data.projectTitle}\n` +
          `👤 *Cliente:* ${session.data.clientName}\n` +
          `💰 *Valor:* ${session.data.value || 'A definir'}\n` +
          `⏰ *Prazo:* ${session.data.deliveryTime || 'A definir'}\n\n` +
          `✅ A proposta foi salva como rascunho na sua conta.\n\n` +
          `🌐 Acesse o sistema para revisar e enviar: [Link do seu sistema]`
        );

        // Limpar sessão
        userSessions.delete(userId);
        
      } catch (error) {
        console.error('Erro ao criar proposta:', error);
        await sendTelegramMessage(chatId, 
          `❌ *Erro ao criar proposta*\n\nOcorreu um erro interno. Tente novamente mais tarde ou use o sistema web diretamente.`
        );
        userSessions.delete(userId);
      }
      break;

    default:
      await sendTelegramMessage(chatId, 
        `❓ Não entendi. Digite /start para começar novamente.`
      );
      break;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const update: TelegramUpdate = await req.json();
      console.log('Webhook recebido:', JSON.stringify(update, null, 2));
      
      await handleMessage(update);
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Bot webhook ativo', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});