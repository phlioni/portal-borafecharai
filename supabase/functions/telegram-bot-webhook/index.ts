
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from: { id: number; first_name: string; username?: string };
    text?: string;
    contact?: { phone_number: string };
    voice?: { file_id: string };
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message: { chat: { id: number } };
    data: string;
  };
}

interface Session {
  step: string;
  data: any;
  userId?: string;
  userProfile?: any;
  proposalData?: any;
}

// Função para buscar usuário pelo telefone na tabela profiles
async function findUserByPhone(phone: string) {
  console.log('🔍 Buscando usuário pelo telefone:', phone);
  
  // Normalizar telefone removendo caracteres especiais
  const normalizedPhone = phone.replace(/\D/g, '');
  console.log('📱 Telefone normalizado:', normalizedPhone);
  
  // Buscar na tabela profiles primeiro
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .or(`phone.eq.${phone},phone.eq.${normalizedPhone},phone.eq.+${normalizedPhone}`)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Erro ao buscar perfil:', profileError);
  }

  if (profile) {
    console.log('✅ Perfil encontrado:', profile);
    return {
      user_id: profile.user_id,
      name: profile.name,
      phone: profile.phone,
      email: null // Vamos buscar o email na tabela auth se necessário
    };
  }

  console.log('❌ Usuário não encontrado pelo telefone');
  return null;
}

// Função para salvar sessão
async function saveSession(telegramUserId: number, chatId: number, session: Session) {
  console.log('💾 Salvando sessão:', { telegramUserId, chatId, session });
  
  const { error } = await supabase
    .from('telegram_sessions')
    .upsert({
      telegram_user_id: telegramUserId,
      chat_id: chatId,
      step: session.step,
      session_data: session.data || {},
      user_id: session.userId || null,
      user_profile: session.userProfile || {},
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  if (error) {
    console.error('❌ Erro ao salvar sessão:', error);
  } else {
    console.log('✅ Sessão salva com sucesso');
  }
}

// Função para carregar sessão
async function loadSession(telegramUserId: number): Promise<Session> {
  console.log('📂 Carregando sessão para usuário:', telegramUserId);
  
  const { data, error } = await supabase
    .from('telegram_sessions')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (error || !data) {
    console.log('🆕 Criando nova sessão');
    return { step: 'start', data: {} };
  }

  console.log('✅ Sessão carregada:', data);
  return {
    step: data.step,
    data: data.session_data || {},
    userId: data.user_id,
    userProfile: data.user_profile || {},
    proposalData: data.session_data?.proposalData || {}
  };
}

// Função para enviar mensagem
async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
      parse_mode: 'HTML'
    })
  });

  return await response.json();
}

// Função para transcrever áudio usando OpenAI
async function transcribeAudio(fileId: string): Promise<string | null> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    // Primeiro, obter informações do arquivo
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();
    
    if (!fileData.ok) {
      console.error('❌ Erro ao obter informações do arquivo:', fileData);
      return null;
    }

    // Baixar o arquivo de áudio
    const audioResponse = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Transcrever usando OpenAI Whisper
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'voice.ogg');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`
      },
      body: formData
    });

    const transcriptionData = await transcriptionResponse.json();
    
    if (transcriptionData.text) {
      console.log('✅ Áudio transcrito:', transcriptionData.text);
      return transcriptionData.text;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao transcrever áudio:', error);
    return null;
  }
}

// Função para processar texto/descrição da proposta usando IA
async function processProposalDescription(description: string): Promise<any> {
  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const prompt = `
Analise a seguinte descrição de proposta e extraia as informações estruturadas:

Descrição: "${description}"

Retorne um JSON com as seguintes informações:
{
  "title": "título da proposta",
  "service_description": "descrição do serviço",
  "detailed_description": "descrição detalhada",
  "value": número ou null,
  "delivery_time": "prazo de entrega",
  "observations": "observações adicionais",
  "missing_info": ["lista", "de", "informações", "que", "ainda", "faltam"],
  "client_info": {
    "name": "nome do cliente se mencionado",
    "email": "email se mencionado",
    "company": "empresa se mencionada"
  }
}

Se alguma informação não estiver clara ou estiver faltando, inclua no array "missing_info".
Informações essenciais: título, descrição do serviço, valor (se aplicável), prazo de entrega.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em análise de propostas comerciais. Sempre retorne respostas em JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Tentar extrair JSON do conteúdo
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Erro ao processar descrição com IA:', error);
    return null;
  }
}

// Função para criar proposta no banco
async function createProposal(userId: string, proposalData: any) {
  console.log('📝 Criando proposta:', proposalData);

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      user_id: userId,
      title: proposalData.title,
      service_description: proposalData.service_description,
      detailed_description: proposalData.detailed_description,
      value: proposalData.value,
      delivery_time: proposalData.delivery_time,
      observations: proposalData.observations,
      status: 'rascunho'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar proposta:', error);
    return null;
  }

  console.log('✅ Proposta criada:', data);
  return data;
}

// Função para enviar proposta por email
async function sendProposalByEmail(proposalId: string, clientEmail: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-proposal-email', {
      body: {
        proposalId,
        clientEmail
      }
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }

    console.log('✅ Email enviado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update: TelegramUpdate = await req.json();
    console.log('📨 Update recebido:', JSON.stringify(update, null, 2));

    // Processar mensagem
    if (update.message) {
      const { chat, from, text, contact, voice } = update.message;
      const chatId = chat.id;
      const telegramUserId = from.id;

      console.log(`👤 Usuário: ${from.first_name} (ID: ${telegramUserId})`);

      // Carregar sessão
      let session = await loadSession(telegramUserId);

      // Comando /start - sempre reinicia
      if (text === '/start') {
        console.log('🔄 Comando /start recebido, reiniciando conversa');
        session = { step: 'start', data: {} };
        await saveSession(telegramUserId, chatId, session);
        
        await sendMessage(chatId, 
          '🤖 <b>Olá! Bem-vindo ao Bot de Propostas!</b>\n\n' +
          '📱 Para começar, preciso que você compartilhe seu número de telefone para identificar sua conta.\n\n' +
          '👇 Clique no botão abaixo para compartilhar:',
          {
            keyboard: [[{ text: '📱 Compartilhar Telefone', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        );
        return new Response('OK', { headers: corsHeaders });
      }

      // Verificar se é compartilhamento de contato
      if (contact) {
        console.log('📱 Contato recebido:', contact.phone_number);
        
        const user = await findUserByPhone(contact.phone_number);
        
        if (user) {
          session.userId = user.user_id;
          session.userProfile = user;
          session.step = 'main_menu';
          
          await saveSession(telegramUserId, chatId, session);
          console.log('✅ Usuário autenticado:', user);
          
          await sendMessage(chatId, 
            `✅ <b>Autenticado com sucesso!</b>\n\n` +
            `👋 Olá, <b>${user.name || 'Usuário'}</b>!\n\n` +
            `🎯 O que você gostaria de fazer?`,
            {
              inline_keyboard: [
                [{ text: '📝 Criar Nova Proposta', callback_data: 'create_proposal' }],
                [{ text: '📋 Minhas Propostas', callback_data: 'my_proposals' }],
                [{ text: '❓ Ajuda', callback_data: 'help' }]
              ]
            }
          );
        } else {
          await sendMessage(chatId, 
            '❌ <b>Telefone não encontrado!</b>\n\n' +
            '📱 Este número não está cadastrado no sistema.\n\n' +
            '💡 Certifique-se de que você já possui uma conta no sistema e que seu telefone está cadastrado no seu perfil.'
          );
        }
        return new Response('OK', { headers: corsHeaders });
      }

      // Verificar se usuário está autenticado
      if (!session.userId) {
        await sendMessage(chatId, 
          '🔐 <b>Você precisa se autenticar primeiro!</b>\n\n' +
          '📱 Use o comando /start para compartilhar seu telefone.'
        );
        return new Response('OK', { headers: corsHeaders });
      }

      // Processar mensagem de voz
      if (voice) {
        if (session.step === 'waiting_proposal_description') {
          await sendMessage(chatId, '🎤 <b>Processando áudio...</b>\n\n⏳ Aguarde enquanto transcrevo sua mensagem.');
          
          const transcription = await transcribeAudio(voice.file_id);
          
          if (transcription) {
            console.log('📝 Transcrição:', transcription);
            // Processar como se fosse texto
            const processedData = await processProposalDescription(transcription);
            
            if (processedData) {
              session.proposalData = { ...session.proposalData, ...processedData };
              
              if (processedData.missing_info && processedData.missing_info.length > 0) {
                session.step = 'requesting_missing_info';
                await saveSession(telegramUserId, chatId, session);
                
                await sendMessage(chatId, 
                  `📝 <b>Informações processadas!</b>\n\n` +
                  `❗ Ainda precisamos de algumas informações:\n\n` +
                  `${processedData.missing_info.map((info: string) => `• ${info}`).join('\n')}\n\n` +
                  `💬 Por favor, forneça essas informações via texto ou áudio:`
                );
              } else {
                // Todas as informações estão completas
                session.step = 'confirm_proposal';
                await saveSession(telegramUserId, chatId, session);
                
                await sendMessage(chatId, 
                  `✅ <b>Proposta processada com sucesso!</b>\n\n` +
                  `📋 <b>Resumo:</b>\n` +
                  `🎯 <b>Título:</b> ${processedData.title}\n` +
                  `💼 <b>Serviço:</b> ${processedData.service_description}\n` +
                  `💰 <b>Valor:</b> ${processedData.value ? `R$ ${processedData.value}` : 'A definir'}\n` +
                  `⏱️ <b>Prazo:</b> ${processedData.delivery_time || 'A definir'}\n\n` +
                  `❓ Confirma a criação desta proposta?`,
                  {
                    inline_keyboard: [
                      [
                        { text: '✅ Confirmar', callback_data: 'confirm_create_proposal' },
                        { text: '❌ Cancelar', callback_data: 'cancel_proposal' }
                      ]
                    ]
                  }
                );
              }
            } else {
              await sendMessage(chatId, 
                '❌ <b>Não consegui processar o áudio.</b>\n\n' +
                '💬 Tente novamente ou envie as informações por texto.'
              );
            }
          } else {
            await sendMessage(chatId, 
              '❌ <b>Erro ao transcrever áudio.</b>\n\n' +
              '💬 Tente novamente ou envie as informações por texto.'
            );
          }
        } else {
          await sendMessage(chatId, 
            '🎤 <b>Áudio não esperado neste momento.</b>\n\n' +
            '💬 Use o menu para navegar pelas opções.'
          );
        }
        return new Response('OK', { headers: corsHeaders });
      }

      // Processar texto
      if (text) {
        // Aguardando descrição da proposta
        if (session.step === 'waiting_proposal_description') {
          await sendMessage(chatId, '🤖 <b>Processando sua descrição...</b>\n\n⏳ Aguarde enquanto analiso as informações.');
          
          const processedData = await processProposalDescription(text);
          
          if (processedData) {
            session.proposalData = { ...session.proposalData, ...processedData };
            
            if (processedData.missing_info && processedData.missing_info.length > 0) {
              session.step = 'requesting_missing_info';
              await saveSession(telegramUserId, chatId, session);
              
              await sendMessage(chatId, 
                `📝 <b>Informações processadas!</b>\n\n` +
                `❗ Ainda precisamos de algumas informações:\n\n` +
                `${processedData.missing_info.map((info: string) => `• ${info}`).join('\n')}\n\n` +
                `💬 Por favor, forneça essas informações via texto ou áudio:`
              );
            } else {
              // Todas as informações estão completas
              session.step = 'confirm_proposal';
              await saveSession(telegramUserId, chatId, session);
              
              await sendMessage(chatId, 
                `✅ <b>Proposta processada com sucesso!</b>\n\n` +
                `📋 <b>Resumo:</b>\n` +
                `🎯 <b>Título:</b> ${processedData.title}\n` +
                `💼 <b>Serviço:</b> ${processedData.service_description}\n` +
                `💰 <b>Valor:</b> ${processedData.value ? `R$ ${processedData.value}` : 'A definir'}\n` +
                `⏱️ <b>Prazo:</b> ${processedData.delivery_time || 'A definir'}\n\n` +
                `❓ Confirma a criação desta proposta?`,
                {
                  inline_keyboard: [
                    [
                      { text: '✅ Confirmar', callback_data: 'confirm_create_proposal' },
                      { text: '❌ Cancelar', callback_data: 'cancel_proposal' }
                    ]
                  ]
                }
              );
            }
          } else {
            await sendMessage(chatId, 
              '❌ <b>Não consegui processar sua descrição.</b>\n\n' +
              '💬 Tente ser mais específico sobre o serviço, valor e prazo de entrega.'
            );
          }
          return new Response('OK', { headers: corsHeaders });
        }

        // Aguardando informações adicionais
        if (session.step === 'requesting_missing_info') {
          const additionalInfo = await processProposalDescription(text);
          
          if (additionalInfo) {
            // Merge das informações
            session.proposalData = {
              ...session.proposalData,
              ...additionalInfo,
              title: additionalInfo.title || session.proposalData.title,
              service_description: additionalInfo.service_description || session.proposalData.service_description,
              detailed_description: additionalInfo.detailed_description || session.proposalData.detailed_description,
              value: additionalInfo.value || session.proposalData.value,
              delivery_time: additionalInfo.delivery_time || session.proposalData.delivery_time,
              observations: additionalInfo.observations || session.proposalData.observations
            };

            if (additionalInfo.missing_info && additionalInfo.missing_info.length > 0) {
              await saveSession(telegramUserId, chatId, session);
              
              await sendMessage(chatId, 
                `📝 <b>Informações atualizadas!</b>\n\n` +
                `❗ Ainda faltam:\n\n` +
                `${additionalInfo.missing_info.map((info: string) => `• ${info}`).join('\n')}\n\n` +
                `💬 Continue fornecendo as informações:`
              );
            } else {
              session.step = 'confirm_proposal';
              await saveSession(telegramUserId, chatId, session);
              
              await sendMessage(chatId, 
                `✅ <b>Todas as informações coletadas!</b>\n\n` +
                `📋 <b>Resumo final:</b>\n` +
                `🎯 <b>Título:</b> ${session.proposalData.title}\n` +
                `💼 <b>Serviço:</b> ${session.proposalData.service_description}\n` +
                `💰 <b>Valor:</b> ${session.proposalData.value ? `R$ ${session.proposalData.value}` : 'A definir'}\n` +
                `⏱️ <b>Prazo:</b> ${session.proposalData.delivery_time || 'A definir'}\n\n` +
                `❓ Confirma a criação desta proposta?`,
                {
                  inline_keyboard: [
                    [
                      { text: '✅ Confirmar', callback_data: 'confirm_create_proposal' },
                      { text: '❌ Cancelar', callback_data: 'cancel_proposal' }
                    ]
                  ]
                }
              );
            }
          } else {
            await sendMessage(chatId, 
              '❌ <b>Não consegui processar as informações adicionais.</b>\n\n' +
              '💬 Tente ser mais claro sobre os detalhes que ainda faltam.'
            );
          }
          return new Response('OK', { headers: corsHeaders });
        }

        // Aguardando email do cliente
        if (session.step === 'waiting_client_email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
          if (emailRegex.test(text)) {
            session.data.clientEmail = text;
            session.step = 'confirm_send_email';
            await saveSession(telegramUserId, chatId, session);
            
            await sendMessage(chatId, 
              `📧 <b>Email confirmado:</b> ${text}\n\n` +
              `❓ Deseja enviar a proposta para este email?`,
              {
                inline_keyboard: [
                  [
                    { text: '✅ Enviar', callback_data: 'send_email_confirmed' },
                    { text: '❌ Cancelar', callback_data: 'back_to_proposal' }
                  ]
                ]
              }
            );
          } else {
            await sendMessage(chatId, 
              '❌ <b>Email inválido!</b>\n\n' +
              '📧 Por favor, digite um email válido:'
            );
          }
          return new Response('OK', { headers: corsHeaders });
        }

        // Mensagem não reconhecida
        await sendMessage(chatId, 
          '❓ <b>Não entendi sua mensagem.</b>\n\n' +
          '🏠 Use /start para voltar ao menu principal.'
        );
      }
    }

    // Processar callback queries (botões)
    if (update.callback_query) {
      const { id, from, message, data } = update.callback_query;
      const chatId = message!.chat.id;
      const telegramUserId = from.id;

      let session = await loadSession(telegramUserId);

      // Responder ao callback
      await fetch(`https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: id })
      });

      console.log('🔘 Callback recebido:', data);

      switch (data) {
        case 'create_proposal':
          session.step = 'waiting_proposal_description';
          session.proposalData = {};
          await saveSession(telegramUserId, chatId, session);
          
          await sendMessage(chatId, 
            '📝 <b>Vamos criar uma nova proposta!</b>\n\n' +
            '🎤 <b>Descreva em texto ou áudio:</b>\n' +
            '• Qual serviço será prestado\n' +
            '• Valor da proposta (se souber)\n' +
            '• Prazo de entrega\n' +
            '• Detalhes importantes\n' +
            '• Informações do cliente (nome, empresa)\n\n' +
            '💡 <b>Dica:</b> Seja o mais detalhado possível. A IA irá analisar e identificar se falta alguma informação importante!'
          );
          break;

        case 'my_proposals':
          // Buscar propostas do usuário
          const { data: proposals, error } = await supabase
            .from('proposals')
            .select('*')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            await sendMessage(chatId, '❌ Erro ao buscar propostas.');
            break;
          }

          if (proposals.length === 0) {
            await sendMessage(chatId, 
              '📋 <b>Você ainda não tem propostas criadas.</b>\n\n' +
              '📝 Que tal criar sua primeira proposta?',
              {
                inline_keyboard: [
                  [{ text: '📝 Criar Nova Proposta', callback_data: 'create_proposal' }]
                ]
              }
            );
          } else {
            const proposalsList = proposals.map((p, index) => 
              `${index + 1}. <b>${p.title}</b>\n` +
              `   💰 ${p.value ? `R$ ${p.value}` : 'Valor não definido'}\n` +
              `   📅 ${new Date(p.created_at).toLocaleDateString('pt-BR')}\n` +
              `   📊 Status: ${p.status}\n`
            ).join('\n');

            await sendMessage(chatId, 
              `📋 <b>Suas últimas propostas:</b>\n\n${proposalsList}\n\n` +
              `💡 Para gerenciar suas propostas, acesse o sistema web.`
            );
          }
          break;

        case 'help':
          await sendMessage(chatId, 
            '❓ <b>Ajuda - Bot de Propostas</b>\n\n' +
            '🔧 <b>O que posso fazer:</b>\n' +
            '• Criar propostas via texto ou áudio\n' +
            '• Analisar descrições com IA\n' +
            '• Enviar propostas por email\n' +
            '• Listar suas propostas\n\n' +
            '💡 <b>Comandos:</b>\n' +
            '• /start - Reiniciar conversa\n\n' +
            '📞 <b>Suporte:</b>\n' +
            'Entre em contato pelo sistema web para ajuda técnica.',
            {
              inline_keyboard: [
                [{ text: '🏠 Menu Principal', callback_data: 'main_menu' }]
              ]
            }
          );
          break;

        case 'main_menu':
          session.step = 'main_menu';
          await saveSession(telegramUserId, chatId, session);
          
          await sendMessage(chatId, 
            `🏠 <b>Menu Principal</b>\n\n` +
            `👋 Olá, <b>${session.userProfile?.name || 'Usuário'}</b>!\n\n` +
            `🎯 O que você gostaria de fazer?`,
            {
              inline_keyboard: [
                [{ text: '📝 Criar Nova Proposta', callback_data: 'create_proposal' }],
                [{ text: '📋 Minhas Propostas', callback_data: 'my_proposals' }],
                [{ text: '❓ Ajuda', callback_data: 'help' }]
              ]
            }
          );
          break;

        case 'confirm_create_proposal':
          const proposal = await createProposal(session.userId!, session.proposalData);
          
          if (proposal) {
            session.data.lastProposalId = proposal.id;
            session.step = 'proposal_created';
            await saveSession(telegramUserId, chatId, session);
            
            await sendMessage(chatId, 
              `✅ <b>Proposta criada com sucesso!</b>\n\n` +
              `📋 <b>ID:</b> ${proposal.id.substring(0, 8)}...\n` +
              `🎯 <b>Título:</b> ${proposal.title}\n\n` +
              `📧 <b>Deseja enviar por email?</b>`,
              {
                inline_keyboard: [
                  [{ text: '📧 Enviar por Email', callback_data: 'send_by_email' }],
                  [{ text: '🏠 Menu Principal', callback_data: 'main_menu' }]
                ]
              }
            );
          } else {
            await sendMessage(chatId, '❌ Erro ao criar proposta. Tente novamente.');
          }
          break;

        case 'cancel_proposal':
          session.step = 'main_menu';
          session.proposalData = {};
          await saveSession(telegramUserId, chatId, session);
          
          await sendMessage(chatId, 
            '❌ <b>Criação de proposta cancelada.</b>\n\n🏠 Voltando ao menu principal...',
            {
              inline_keyboard: [
                [{ text: '📝 Criar Nova Proposta', callback_data: 'create_proposal' }],
                [{ text: '📋 Minhas Propostas', callback_data: 'my_proposals' }],
                [{ text: '❓ Ajuda', callback_data: 'help' }]
              ]
            }
          );
          break;

        case 'send_by_email':
          session.step = 'waiting_client_email';
          await saveSession(telegramUserId, chatId, session);
          
          await sendMessage(chatId, 
            '📧 <b>Envio por Email</b>\n\n' +
            '✉️ Digite o email do cliente para enviar a proposta:'
          );
          break;

        case 'send_email_confirmed':
          const emailSent = await sendProposalByEmail(session.data.lastProposalId, session.data.clientEmail);
          
          if (emailSent) {
            await sendMessage(chatId, 
              `✅ <b>Email enviado com sucesso!</b>\n\n` +
              `📧 A proposta foi enviada para: <b>${session.data.clientEmail}</b>\n\n` +
              `🎉 O cliente receberá um link para visualizar e responder à proposta.`,
              {
                inline_keyboard: [
                  [{ text: '🏠 Menu Principal', callback_data: 'main_menu' }]
                ]
              }
            );
          } else {
            await sendMessage(chatId, 
              '❌ <b>Erro ao enviar email.</b>\n\n' +
              '⚠️ Verifique se o email está correto e tente novamente.',
              {
                inline_keyboard: [
                  [{ text: '🔄 Tentar Novamente', callback_data: 'send_by_email' }],
                  [{ text: '🏠 Menu Principal', callback_data: 'main_menu' }]
                ]
              }
            );
          }
          break;

        case 'back_to_proposal':
          session.step = 'proposal_created';
          await saveSession(telegramUserId, chatId, session);
          
          await sendMessage(chatId, 
            `📋 <b>Proposta criada!</b>\n\n` +
            `🎯 O que deseja fazer agora?`,
            {
              inline_keyboard: [
                [{ text: '📧 Enviar por Email', callback_data: 'send_by_email' }],
                [{ text: '🏠 Menu Principal', callback_data: 'main_menu' }]
              ]
            }
          );
          break;

        default:
          await sendMessage(chatId, '❓ Ação não reconhecida.');
          break;
      }
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);
