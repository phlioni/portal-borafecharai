
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
      file_id: string;
      file_unique_id: string;
      mime_type?: string;
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
    aiGeneratedContent?: string;
    missingFields?: string[];
  };
  phone?: string;
  userId?: string;
  userProfile?: {
    name?: string;
    phone?: string;
    email?: string;
  };
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

async function downloadTelegramFile(fileId: string): Promise<ArrayBuffer | null> {
  if (!botToken) return null;

  try {
    // Primeiro, obter informações do arquivo
    const fileInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileInfo = await fileInfoResponse.json();

    if (!fileInfo.ok) {
      console.error('Erro ao obter informações do arquivo:', fileInfo);
      return null;
    }

    // Baixar o arquivo
    const fileResponse = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`);
    return await fileResponse.arrayBuffer();
  } catch (error) {
    console.error('Erro ao baixar arquivo do Telegram:', error);
    return null;
  }
}

async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/ogg' });
    formData.append('file', blob, 'audio.ogg');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('Erro na transcrição:', await response.text());
      return null;
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    return null;
  }
}

async function processWithAI(content: string): Promise<{ processedData: any, missingFields: string[] }> {
  try {
    const prompt = `
Analise o seguinte texto e extraia informações para uma proposta comercial:

"${content}"

Extraia e estruture as seguintes informações:
1. Nome do cliente/empresa
2. Título do projeto
3. Descrição do serviço
4. Descrição detalhada do que será entregue
5. Valor (se mencionado)
6. Prazo de entrega
7. Observações adicionais

Responda APENAS em formato JSON válido com esta estrutura:
{
  "clientName": "string ou null",
  "projectTitle": "string ou null", 
  "serviceDescription": "string ou null",
  "detailedDescription": "string ou null",
  "value": "string ou null",
  "deliveryTime": "string ou null",
  "observations": "string ou null",
  "missingFields": ["array com campos que precisam ser preenchidos"]
}

Para missingFields, inclua apenas os campos essenciais que não foram identificados no texto:
- "clientName" se não identificou o cliente
- "projectTitle" se não identificou o projeto
- "serviceDescription" se não identificou o serviço
- "detailedDescription" se a descrição está muito vaga
- "value" se não mencionou valor
- "deliveryTime" se não mencionou prazo
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Erro na API OpenAI:', await response.text());
      return { processedData: {}, missingFields: [] };
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        processedData: parsed,
        missingFields: parsed.missingFields || []
      };
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      return { processedData: {}, missingFields: [] };
    }
  } catch (error) {
    console.error('Erro ao processar com IA:', error);
    return { processedData: {}, missingFields: [] };
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

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao carregar sessão:', error);
    }

    if (sessionData) {
      console.log('Sessão encontrada:', sessionData);

      if (new Date(sessionData.expires_at) > new Date()) {
        return {
          step: sessionData.step,
          data: sessionData.session_data || {},
          phone: sessionData.phone,
          userId: sessionData.user_id,
          userProfile: sessionData.user_profile || {}
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

  return { step: 'start', data: {} };
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
        user_profile: session.userProfile,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }, {
        onConflict: 'telegram_user_id'
      });

    if (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
  }
}

async function findUserByPhone(phone: string) {
  console.log('Buscando usuário pelo telefone:', phone);

  const cleanPhone = phone.replace(/\D/g, '');
  
  // Buscar primeiro na tabela profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, name, phone')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  if (profiles && profiles.length > 0) {
    console.log('Usuário encontrado na tabela profiles:', profiles[0]);
    return profiles[0];
  }

  // Buscar na tabela companies como fallback
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('user_id, name, email, phone, country_code')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone}`)
    .limit(1);

  if (companies && companies.length > 0) {
    console.log('Usuário encontrado na tabela companies:', companies[0]);
    return companies[0];
  }

  return null;
}

async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

async function getUserEmail(userId: string) {
  try {
    const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Erro ao buscar email do usuário:', error);
      return null;
    }

    return userData.user?.email || null;
  } catch (error) {
    console.error('Erro ao buscar email do usuário:', error);
    return null;
  }
}

async function sendProposalEmail(proposalId: string, recipientEmail: string, recipientName: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-proposal-email', {
      body: {
        proposalId,
        recipientEmail,
        recipientName
      }
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

async function createProposalForUser(session: UserSession) {
  console.log('Criando proposta para usuário:', session.userId);

  if (!session.userId) {
    throw new Error('Usuário não identificado');
  }

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
      template_id: 'moderno',
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
  console.log('=== PROCESSANDO MENSAGEM ===');
  
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const text = message.text || '';
  const voice = message.voice;

  let session = await loadSession(telegramUserId, chatId);

  if (text === '/start') {
    await supabase.from('telegram_sessions').delete().eq('telegram_user_id', telegramUserId);
    session = { step: 'start', data: {} };
  }

  if (message.contact) {
    session.phone = message.contact.phone_number;
    const user = await findUserByPhone(session.phone);
    
    if (user) {
      session.userId = user.user_id;
      session.userProfile = await getUserProfile(user.user_id);
      
      const userEmail = await getUserEmail(user.user_id);
      if (userEmail) {
        session.userProfile.email = userEmail;
      }

      await supabase
        .from('telegram_bot_settings')
        .upsert({ user_id: user.user_id, chat_id: chatId }, { onConflict: 'user_id' });

      const userName = session.userProfile?.name || user.name || 'Usuário';
      
      const keyboard = {
        keyboard: [
          [{ text: "🆕 Criar Nova Proposta" }],
          [{ text: "📊 Ver Status das Propostas" }]
        ],
        one_time_keyboard: false,
        resize_keyboard: true
      };

      await sendTelegramMessage(chatId,
        `✅ *Telefone identificado!* Olá ${userName}!\n\n` +
        `📱 Telefone: ${session.userProfile?.phone || session.phone}\n\n` +
        `🤖 *Bem-vindo ao @borafecharai_bot!*\n\n` +
        `🚀 O que você gostaria de fazer?`,
        keyboard
      );
      session.step = 'main_menu';
    } else {
      await sendTelegramMessage(chatId,
        `❌ *Telefone não encontrado na nossa base de dados.*\n\n` +
        `Para usar este bot, você precisa:\n` +
        `1. Ter uma conta no sistema Bora Fechar Aí\n` +
        `2. Cadastrar seu telefone em "Configurações > Meu Perfil"\n\n` +
        `📱 Telefone pesquisado: ${session.phone}\n\n` +
        `Digite /start para tentar novamente.`
      );
      return;
    }

    await saveSession(telegramUserId, chatId, session);
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
        `🤖 *Olá! Eu sou o @borafecharai_bot!*\n\n` +
        `Sou seu assistente para criação de propostas profissionais.\n\n` +
        `📲 *Funcionalidades:*\n` +
        `• Criar propostas pelo Telegram\n` +
        `• Processar texto e áudio com IA\n` +
        `• Enviar propostas por e-mail\n` +
        `• Ver status das suas propostas\n\n` +
        `Para começar, preciso identificar você pelo seu telefone cadastrado no sistema.\n\n` +
        `👇 *Clique no botão abaixo para compartilhar seu telefone:*`,
        keyboard
      );
      break;

    case 'main_menu':
      if (text === '🆕 Criar Nova Proposta') {
        session.step = 'ai_input';
        session.data = {};
        await sendTelegramMessage(chatId,
          `🆕 *Vamos criar uma nova proposta!*\n\n` +
          `🎯 *Descreva sua proposta de forma completa:*\n\n` +
          `Você pode enviar:\n` +
          `📝 **Texto detalhado** com todas as informações\n` +
          `🎙️ **Áudio** explicando a proposta\n\n` +
          `💡 *Inclua o máximo de detalhes possível:*\n` +
          `• Nome do cliente/empresa\n` +
          `• Título do projeto\n` +
          `• Descrição do serviço\n` +
          `• O que será entregue\n` +
          `• Valor (se souber)\n` +
          `• Prazo de entrega\n` +
          `• Observações importantes\n\n` +
          `🤖 *A IA irá processar e organizar as informações!*`
        );
      } else if (text === '📊 Ver Status das Propostas') {
        const { data: proposals } = await supabase
          .from('proposals')
          .select(`
            id, title, status, value, created_at,
            companies (name)
          `)
          .eq('user_id', session.userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!proposals || proposals.length === 0) {
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
      }
      break;

    case 'ai_input':
      let contentToProcess = '';

      if (voice) {
        await sendTelegramMessage(chatId, `🎙️ *Processando áudio...*\n\n⏳ Aguarde um momento...`);
        
        const audioBuffer = await downloadTelegramFile(voice.file_id);
        if (audioBuffer) {
          const transcription = await transcribeAudio(audioBuffer);
          if (transcription) {
            contentToProcess = transcription;
            await sendTelegramMessage(chatId, `🎙️ *Áudio transcrito:*\n\n"${transcription}"\n\n🤖 *Processando com IA...*`);
          } else {
            await sendTelegramMessage(chatId, `❌ *Erro ao transcrever áudio.*\n\nTente novamente com texto ou outro áudio.`);
            return;
          }
        } else {
          await sendTelegramMessage(chatId, `❌ *Erro ao baixar áudio.*\n\nTente novamente.`);
          return;
        }
      } else if (text) {
        contentToProcess = text;
        await sendTelegramMessage(chatId, `🤖 *Processando informações com IA...*\n\n⏳ Aguarde um momento...`);
      }

      if (contentToProcess) {
        const { processedData, missingFields } = await processWithAI(contentToProcess);
        
        session.data = { ...session.data, ...processedData };
        session.data.aiGeneratedContent = contentToProcess;
        session.data.missingFields = missingFields;

        if (missingFields.length > 0) {
          session.step = 'collect_missing';
          
          const fieldNames = {
            'clientName': 'Nome do cliente/empresa',
            'projectTitle': 'Título do projeto',
            'serviceDescription': 'Descrição do serviço',
            'detailedDescription': 'Descrição detalhada',
            'value': 'Valor da proposta',
            'deliveryTime': 'Prazo de entrega'
          };

          const missingFieldsText = missingFields.map(field => `• ${fieldNames[field] || field}`).join('\n');
          
          await sendTelegramMessage(chatId,
            `🤖 *Informações processadas com sucesso!*\n\n` +
            `✅ *Dados identificados:*\n` +
            `${session.data.clientName ? `• Cliente: ${session.data.clientName}\n` : ''}` +
            `${session.data.projectTitle ? `• Projeto: ${session.data.projectTitle}\n` : ''}` +
            `${session.data.serviceDescription ? `• Serviço: ${session.data.serviceDescription}\n` : ''}` +
            `${session.data.value ? `• Valor: ${session.data.value}\n` : ''}` +
            `${session.data.deliveryTime ? `• Prazo: ${session.data.deliveryTime}\n` : ''}` +
            `\n⚠️ *Informações necessárias:*\n${missingFieldsText}\n\n` +
            `📝 *Por favor, forneça essas informações para finalizar a proposta.*`
          );
        } else {
          session.step = 'confirm_proposal';
          await sendTelegramMessage(chatId,
            `🎉 *Proposta processada com sucesso!*\n\n` +
            `✅ *Resumo da proposta:*\n` +
            `• **Cliente:** ${session.data.clientName}\n` +
            `• **Projeto:** ${session.data.projectTitle}\n` +
            `• **Serviço:** ${session.data.serviceDescription}\n` +
            `• **Valor:** ${session.data.value || 'A definir'}\n` +
            `• **Prazo:** ${session.data.deliveryTime || 'A definir'}\n\n` +
            `🤖 *Deseja criar esta proposta?*`,
            {
              keyboard: [
                [{ text: "✅ Criar Proposta" }],
                [{ text: "❌ Cancelar" }]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          );
        }
      }
      break;

    case 'collect_missing':
      // Processar informação adicional fornecida pelo usuário
      const missingFields = session.data.missingFields || [];
      if (missingFields.length > 0) {
        const currentField = missingFields[0];
        
        // Atualizar o campo correspondente
        if (currentField === 'clientName') {
          session.data.clientName = text;
        } else if (currentField === 'projectTitle') {
          session.data.projectTitle = text;
        } else if (currentField === 'serviceDescription') {
          session.data.serviceDescription = text;
        } else if (currentField === 'detailedDescription') {
          session.data.detailedDescription = text;
        } else if (currentField === 'value') {
          session.data.value = text;
        } else if (currentField === 'deliveryTime') {
          session.data.deliveryTime = text;
        }

        // Remover o campo da lista de campos faltantes
        session.data.missingFields = missingFields.slice(1);

        if (session.data.missingFields.length > 0) {
          const nextField = session.data.missingFields[0];
          const fieldPrompts = {
            'clientName': 'Nome do cliente/empresa',
            'projectTitle': 'Título do projeto',
            'serviceDescription': 'Descrição do serviço',
            'detailedDescription': 'Descrição detalhada do que será entregue',
            'value': 'Valor da proposta',
            'deliveryTime': 'Prazo de entrega'
          };

          await sendTelegramMessage(chatId,
            `✅ *Informação salva!*\n\n📝 *Agora informe:*\n${fieldPrompts[nextField] || nextField}`
          );
        } else {
          session.step = 'confirm_proposal';
          await sendTelegramMessage(chatId,
            `🎉 *Todas as informações coletadas!*\n\n` +
            `✅ *Resumo da proposta:*\n` +
            `• **Cliente:** ${session.data.clientName}\n` +
            `• **Projeto:** ${session.data.projectTitle}\n` +
            `• **Serviço:** ${session.data.serviceDescription}\n` +
            `• **Valor:** ${session.data.value || 'A definir'}\n` +
            `• **Prazo:** ${session.data.deliveryTime || 'A definir'}\n\n` +
            `🤖 *Deseja criar esta proposta?*`,
            {
              keyboard: [
                [{ text: "✅ Criar Proposta" }],
                [{ text: "❌ Cancelar" }]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          );
        }
      }
      break;

    case 'confirm_proposal':
      if (text === '✅ Criar Proposta') {
        try {
          await sendTelegramMessage(chatId, `🎯 *Criando proposta...*\n\n⏳ Aguarde um momento...`);
          
          const proposal = await createProposalForUser(session);
          
          session.data.proposalId = proposal.id;
          session.step = 'email_options';

          const keyboard = {
            keyboard: [
              [{ text: "📧 Enviar por E-mail" }],
              [{ text: "📋 Finalizar (Apenas Salvar)" }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          };

          await sendTelegramMessage(chatId,
            `🎉 *Proposta criada com sucesso!*\n\n` +
            `📋 *Proposta:* ${session.data.projectTitle}\n` +
            `👤 *Cliente:* ${session.data.clientName}\n` +
            `📁 *Status:* Rascunho\n\n` +
            `🤖 *O que deseja fazer agora?*`,
            keyboard
          );
        } catch (error) {
          await sendTelegramMessage(chatId,
            `❌ *Erro ao criar proposta*\n\n${error.message}\n\n🔄 Tente novamente digitando /start`
          );
        }
      } else if (text === '❌ Cancelar') {
        session.step = 'main_menu';
        session.data = {};
        
        const keyboard = {
          keyboard: [
            [{ text: "🆕 Criar Nova Proposta" }],
            [{ text: "📊 Ver Status das Propostas" }]
          ],
          one_time_keyboard: false,
          resize_keyboard: true
        };

        await sendTelegramMessage(chatId,
          `❌ *Proposta cancelada*\n\n🤖 *O que você gostaria de fazer?*`,
          keyboard
        );
      }
      break;

    case 'email_options':
      if (text === '📧 Enviar por E-mail') {
        if (session.data.clientEmail) {
          session.step = 'sending_email';
          await sendTelegramMessage(chatId,
            `📧 *Enviando proposta por e-mail...*\n\n` +
            `📬 *Destinatário:* ${session.data.clientEmail}\n` +
            `⏳ *Aguarde um momento...*`
          );

          const emailSent = await sendProposalEmail(
            session.data.proposalId,
            session.data.clientEmail,
            session.data.clientName
          );

          if (emailSent) {
            await sendTelegramMessage(chatId,
              `✅ *E-mail enviado com sucesso!*\n\n` +
              `📧 *Enviado para:* ${session.data.clientEmail}\n` +
              `📋 *Proposta:* ${session.data.projectTitle}\n\n` +
              `🎯 *A proposta foi enviada e você será notificado sobre atualizações!*`
            );
          } else {
            await sendTelegramMessage(chatId,
              `❌ *Erro ao enviar e-mail*\n\n` +
              `🔄 *Tente novamente ou acesse o sistema web para enviar manualmente.*`
            );
          }
        } else {
          session.step = 'collect_email';
          await sendTelegramMessage(chatId,
            `📧 *E-mail do cliente necessário*\n\n` +
            `✉️ *Por favor, informe o e-mail do cliente para enviar a proposta:*`
          );
        }
      } else if (text === '📋 Finalizar (Apenas Salvar)') {
        session.step = 'main_menu';
        session.data = {};
        
        const keyboard = {
          keyboard: [
            [{ text: "🆕 Criar Nova Proposta" }],
            [{ text: "📊 Ver Status das Propostas" }]
          ],
          one_time_keyboard: false,
          resize_keyboard: true
        };

        await sendTelegramMessage(chatId,
          `✅ *Proposta salva com sucesso!*\n\n` +
          `📋 *A proposta está disponível no sistema como rascunho.*\n` +
          `🌐 *Acesse o painel web para revisar e enviar quando quiser.*\n\n` +
          `🤖 *O que você gostaria de fazer agora?*`,
          keyboard
        );
      }
      break;

    case 'collect_email':
      if (text && text.includes('@')) {
        session.data.clientEmail = text;
        session.step = 'sending_email';
        
        await sendTelegramMessage(chatId,
          `📧 *Enviando proposta por e-mail...*\n\n` +
          `📬 *Destinatário:* ${session.data.clientEmail}\n` +
          `⏳ *Aguarde um momento...*`
        );

        const emailSent = await sendProposalEmail(
          session.data.proposalId,
          session.data.clientEmail,
          session.data.clientName
        );

        if (emailSent) {
          await sendTelegramMessage(chatId,
            `✅ *E-mail enviado com sucesso!*\n\n` +
            `📧 *Enviado para:* ${session.data.clientEmail}\n` +
            `📋 *Proposta:* ${session.data.projectTitle}\n\n` +
            `🎯 *A proposta foi enviada e você será notificado sobre atualizações!*`
          );
          
          session.step = 'main_menu';
          session.data = {};
        } else {
          await sendTelegramMessage(chatId,
            `❌ *Erro ao enviar e-mail*\n\n` +
            `🔄 *Tente novamente ou acesse o sistema web para enviar manualmente.*`
          );
        }
      } else {
        await sendTelegramMessage(chatId,
          `❌ *E-mail inválido*\n\n` +
          `✉️ *Por favor, informe um e-mail válido para o cliente:*`
        );
      }
      break;

    default:
      await sendTelegramMessage(chatId,
        `❓ *Não entendi sua mensagem.*\n\n` +
        `🤖 Para começar uma nova conversa, digite /start`
      );
      break;
  }

  await saveSession(telegramUserId, chatId, session);
}

serve(async (req) => {
  console.log('=== WEBHOOK TELEGRAM CHAMADO ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const body = await req.text();
      const update: TelegramUpdate = JSON.parse(body);
      
      await handleMessage(update);
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('🤖 @borafecharai_bot webhook ativo e funcionando!', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('=== ERRO NO WEBHOOK ===', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
