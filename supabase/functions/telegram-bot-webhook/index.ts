
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from: { id: number; first_name: string; username?: string };
    text?: string;
    contact?: { phone_number: string };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update: TelegramUpdate = await req.json();
    console.log('Received update:', JSON.stringify(update, null, 2));

    if (!update.message) {
      return new Response('OK', { status: 200 });
    }

    const { chat, from, text, contact } = update.message;
    const chatId = chat.id;
    const telegramUserId = from.id;
    const userName = from.first_name;

    // Buscar ou criar sessão
    let { data: session } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .eq('chat_id', chatId)
      .single();

    if (!session) {
      const { data: newSession } = await supabase
        .from('telegram_sessions')
        .insert({
          telegram_user_id: telegramUserId,
          chat_id: chatId,
          step: 'start',
          session_data: { userName },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      
      session = newSession;
    }

    let responseText = '';
    let newStep = session.step;
    let sessionData = session.session_data || {};

    // Processar baseado no step atual
    switch (session.step) {
      case 'start':
        if (text === '/start') {
          responseText = `Olá ${userName}! 👋\n\nVou te ajudar a criar uma proposta comercial.\n\nPara começar, preciso de algumas informações:\n\n1️⃣ Qual é o nome do cliente ou empresa?`;
          newStep = 'waiting_client';
        }
        break;

      case 'waiting_client':
        sessionData.client = text;
        responseText = `✅ Cliente: ${text}\n\n2️⃣ Qual é o nome do responsável no cliente?`;
        newStep = 'waiting_responsible';
        break;

      case 'waiting_responsible':
        sessionData.responsible = text;
        responseText = `✅ Responsável: ${text}\n\n3️⃣ Qual é o título/nome do projeto/serviço?`;
        newStep = 'waiting_title';
        break;

      case 'waiting_title':
        sessionData.title = text;
        responseText = `✅ Título: ${text}\n\n4️⃣ Descreva detalhadamente o serviço/projeto:`;
        newStep = 'waiting_description';
        break;

      case 'waiting_description':
        sessionData.description = text;
        responseText = `✅ Descrição salva!\n\n5️⃣ Qual é o valor total do projeto? (exemplo: 5000)`;
        newStep = 'waiting_value';
        break;

      case 'waiting_value':
        sessionData.value = parseFloat(text?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        responseText = `✅ Valor: R$ ${sessionData.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n6️⃣ Qual é o prazo de entrega? (exemplo: 30 dias)`;
        newStep = 'waiting_delivery';
        break;

      case 'waiting_delivery':
        sessionData.delivery_time = text;
        responseText = `✅ Prazo: ${text}\n\n7️⃣ Você gostaria de incluir um orçamento detalhado com materiais e mão de obra?\n\nResponda:\n• SIM - para incluir orçamento detalhado\n• NÃO - para pular esta etapa`;
        newStep = 'waiting_budget_choice';
        break;

      case 'waiting_budget_choice':
        if (text?.toUpperCase().includes('SIM')) {
          sessionData.includeBudget = true;
          sessionData.budgetItems = [];
          responseText = `✅ Vamos incluir orçamento detalhado!\n\n📋 Agora me informe os itens do orçamento.\n\nPara cada item, envie no formato:\n**Tipo|Descrição|Quantidade|Valor**\n\nOnde:\n• Tipo: "material" ou "mao_de_obra"\n• Descrição: descrição do item\n• Quantidade: número\n• Valor: valor unitário\n\nExemplo:\nmaterial|Cabo de rede|10|15.50\n\nPara vários itens, separe com vírgula:\nmaterial|Cabo de rede|10|15.50,mao_de_obra|Instalação|1|200.00\n\nOu digite FINALIZAR quando terminar.`;
          newStep = 'waiting_budget_items';
        } else {
          sessionData.includeBudget = false;
          responseText = `✅ Orçamento detalhado não será incluído.\n\n8️⃣ Alguma observação especial? (ou digite PULAR)`;
          newStep = 'waiting_observations';
        }
        break;

      case 'waiting_budget_items':
        if (text?.toUpperCase() === 'FINALIZAR') {
          responseText = `✅ Itens do orçamento salvos!\n\n8️⃣ Alguma observação especial? (ou digite PULAR)`;
          newStep = 'waiting_observations';
        } else {
          // Processar itens do orçamento
          try {
            const items = text?.split(',') || [];
            const budgetItems = sessionData.budgetItems || [];
            
            for (const item of items) {
              const [type, description, quantity, price] = item.split('|');
              if (type && description && quantity && price) {
                budgetItems.push({
                  type: type.trim(),
                  description: description.trim(),
                  quantity: parseFloat(quantity.trim()),
                  unit_price: parseFloat(price.trim())
                });
              }
            }
            
            sessionData.budgetItems = budgetItems;
            responseText = `✅ Itens adicionados!\n\nTotal de itens: ${budgetItems.length}\n\nPara adicionar mais itens, continue enviando no mesmo formato.\nOu digite FINALIZAR para continuar.`;
          } catch (error) {
            responseText = `❌ Formato incorreto!\n\nUse: tipo|descrição|quantidade|valor\n\nExemplo:\nmaterial|Cabo de rede|10|15.50`;
          }
        }
        break;

      case 'waiting_observations':
        if (text?.toUpperCase() !== 'PULAR') {
          sessionData.observations = text;
        }
        responseText = `🎉 Informações coletadas com sucesso!\n\n📋 **Resumo da Proposta:**\n\n👤 **Cliente:** ${sessionData.client}\n🏢 **Responsável:** ${sessionData.responsible}\n📋 **Título:** ${sessionData.title}\n💰 **Valor:** R$ ${sessionData.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n⏰ **Prazo:** ${sessionData.delivery_time}\n🔧 **Orçamento detalhado:** ${sessionData.includeBudget ? 'Sim' : 'Não'}\n\nDigite CONFIRMAR para criar a proposta ou CANCELAR para recomeçar.`;
        newStep = 'waiting_confirmation';
        break;

      case 'waiting_confirmation':
        if (text?.toUpperCase() === 'CONFIRMAR') {
          // Buscar usuário pelo telefone (se disponível) ou criar proposta genérica
          let userId = null;
          
          if (session.phone) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id')
              .eq('phone', session.phone)
              .single();
            
            userId = profile?.user_id;
          }

          if (userId) {
            // Criar proposta no banco
            const { data: proposal, error: proposalError } = await supabase
              .from('proposals')
              .insert({
                title: sessionData.title,
                service_description: sessionData.title,
                detailed_description: sessionData.description,
                value: sessionData.value,
                delivery_time: sessionData.delivery_time,
                observations: sessionData.observations || null,
                template_id: 'moderno',
                user_id: userId,
                status: 'enviada'
              })
              .select()
              .single();

            if (!proposalError && proposal && sessionData.budgetItems?.length > 0) {
              // Criar itens de orçamento
              for (const item of sessionData.budgetItems) {
                await supabase
                  .from('proposal_budget_items')
                  .insert({
                    proposal_id: proposal.id,
                    type: item.type === 'mao_de_obra' ? 'labor' : 'material',
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                  });
              }
            }

            if (proposalError) {
              responseText = `❌ Erro ao criar proposta: ${proposalError.message}`;
            } else {
              responseText = `✅ **Proposta criada com sucesso!**\n\nVocê pode visualizá-la acessando sua conta no sistema.\n\n🔄 Digite /start para criar uma nova proposta.`;
            }
          } else {
            responseText = `✅ **Dados da proposta coletados!**\n\nPara finalizar a criação, você precisa estar logado no sistema.\n\nPor favor, acesse sua conta e crie a proposta com os dados coletados.\n\n🔄 Digite /start para uma nova coleta.`;
          }
          
          newStep = 'completed';
        } else if (text?.toUpperCase() === 'CANCELAR') {
          responseText = `❌ Processo cancelado.\n\n🔄 Digite /start para recomeçar.`;
          newStep = 'start';
          sessionData = {};
        }
        break;

      case 'completed':
        if (text === '/start') {
          responseText = `Olá ${userName}! 👋\n\nVou te ajudar a criar uma nova proposta comercial.\n\nPara começar, preciso de algumas informações:\n\n1️⃣ Qual é o nome do cliente ou empresa?`;
          newStep = 'waiting_client';
          sessionData = { userName };
        } else {
          responseText = `🔄 Digite /start para criar uma nova proposta.`;
        }
        break;

      default:
        responseText = `🔄 Digite /start para começar.`;
        newStep = 'start';
        break;
    }

    // Atualizar sessão
    await supabase
      .from('telegram_sessions')
      .update({
        step: newStep,
        session_data: sessionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    // Buscar configurações do bot para enviar resposta
    const { data: botSettings } = await supabase
      .from('telegram_bot_settings')
      .select('bot_token')
      .not('bot_token', 'is', null)
      .limit(1)
      .single();

    if (botSettings?.bot_token && responseText) {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botSettings.bot_token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown'
        })
      });

      if (!telegramResponse.ok) {
        console.error('Erro ao enviar mensagem:', await telegramResponse.text());
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
