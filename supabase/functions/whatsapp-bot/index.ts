
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface WhatsAppMessage {
  from: string;
  text?: {
    body: string;
  };
  type: string;
}

interface WhatsAppWebhookData {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: WhatsAppMessage[];
        statuses?: any[];
      };
    }>;
  }>;
}

interface UserSession {
  step: string;
  data: any;
  created_at: Date;
  user_id?: string;
  client_data?: any;
  proposal_data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== WhatsApp Bot Webhook Triggered ===');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  
  if (!supabaseUrl || !supabaseServiceKey || !whatsappToken) {
    console.error('Missing required environment variables');
    return new Response('Configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      // Webhook verification
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === 'whatsapp_verify_token') {
        console.log('Webhook verified successfully');
        return new Response(challenge, { status: 200 });
      }

      return new Response('Verification failed', { status: 403 });
    }

    if (req.method === 'POST') {
      const body: WhatsAppWebhookData = await req.json();
      console.log('Webhook payload:', JSON.stringify(body, null, 2));

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              await processMessage(message, supabase, whatsappToken);
            }
          }
        }
      }

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal error', { 
      status: 500,
      headers: corsHeaders
    });
  }
});

async function processMessage(message: WhatsAppMessage, supabase: any, whatsappToken: string) {
  if (message.type !== 'text' || !message.text?.body) {
    return;
  }

  const phoneNumber = message.from;
  const messageText = message.text.body.toLowerCase().trim();

  console.log(`Processing message from ${phoneNumber}: ${messageText}`);

  // Get or create session
  let session = await getSession(phoneNumber, supabase);
  
  if (!session) {
    session = await createSession(phoneNumber, supabase);
  }

  // Check if user is registered
  const user = await getUserByPhone(phoneNumber, supabase);
  
  if (user) {
    // User flow
    await handleUserFlow(phoneNumber, messageText, session, user, supabase, whatsappToken);
  } else {
    // Client flow (proposal recipient)
    await handleClientFlow(phoneNumber, messageText, session, supabase, whatsappToken);
  }
}

async function getSession(phoneNumber: string, supabase: any): Promise<UserSession | null> {
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting session:', error);
    return null;
  }

  return data;
}

async function createSession(phoneNumber: string, supabase: any): Promise<UserSession> {
  const session = {
    phone_number: phoneNumber,
    step: 'start',
    session_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .insert([session])
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return data;
}

async function updateSession(phoneNumber: string, updates: any, supabase: any) {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('phone_number', phoneNumber);

  if (error) {
    console.error('Error updating session:', error);
  }
}

async function getUserByPhone(phoneNumber: string, supabase: any) {
  // Check in profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('phone', phoneNumber)
    .single();

  if (profile) {
    return { user_id: profile.user_id, phone: phoneNumber };
  }

  // Check in user_companies table
  const { data: company } = await supabase
    .from('user_companies')
    .select('user_id')
    .eq('phone', phoneNumber)
    .single();

  if (company) {
    return { user_id: company.user_id, phone: phoneNumber };
  }

  return null;
}

async function handleUserFlow(phoneNumber: string, messageText: string, session: UserSession, user: any, supabase: any, whatsappToken: string) {
  console.log(`Handling user flow. Step: ${session.step}, Message: ${messageText}`);

  switch (session.step) {
    case 'start':
      await sendMessage(phoneNumber, 
        `🎯 *BoraFecharAI - WhatsApp Bot*\n\n` +
        `Olá! Como posso ajudá-lo hoje?\n\n` +
        `1️⃣ Criar nova proposta\n` +
        `2️⃣ Ver minhas propostas\n` +
        `3️⃣ Enviar proposta por email\n\n` +
        `Digite o número da opção desejada.`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { step: 'menu' }, supabase);
      break;

    case 'menu':
      if (messageText === '1') {
        await sendMessage(phoneNumber, 
          `📝 *Nova Proposta*\n\n` +
          `Vamos criar uma nova proposta!\n\n` +
          `Primeiro, me informe o *nome completo* do cliente:`, 
          whatsappToken
        );
        await updateSession(phoneNumber, { 
          step: 'collect_client_name',
          session_data: { user_id: user.user_id }
        }, supabase);
      } else if (messageText === '2') {
        await handleViewProposals(phoneNumber, user.user_id, supabase, whatsappToken);
      } else if (messageText === '3') {
        await sendMessage(phoneNumber, 
          `📧 *Enviar Proposta*\n\n` +
          `Digite o ID da proposta que deseja enviar por email:`, 
          whatsappToken
        );
        await updateSession(phoneNumber, { step: 'send_proposal_id' }, supabase);
      } else {
        await sendMessage(phoneNumber, 
          `❌ Opção inválida. Digite 1, 2 ou 3.`, 
          whatsappToken
        );
      }
      break;

    case 'collect_client_name':
      const clientName = messageText;
      const sessionData = session.session_data || {};
      sessionData.client_name = clientName;

      // Check if client exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.user_id)
        .ilike('name', `%${clientName}%`)
        .limit(1)
        .single();

      if (existingClient) {
        await sendMessage(phoneNumber, 
          `✅ Cliente encontrado!\n\n` +
          `*Nome:* ${existingClient.name}\n` +
          `*Email:* ${existingClient.email || 'Não informado'}\n` +
          `*Telefone:* ${existingClient.phone || 'Não informado'}\n\n` +
          `É este cliente? (sim/não)`, 
          whatsappToken
        );
        sessionData.existing_client = existingClient;
        await updateSession(phoneNumber, { 
          step: 'confirm_client',
          session_data: sessionData
        }, supabase);
      } else {
        await sendMessage(phoneNumber, 
          `📱 Cliente não encontrado. Será criado um novo cadastro.\n\n` +
          `Agora me informe o *telefone* do cliente:`, 
          whatsappToken
        );
        await updateSession(phoneNumber, { 
          step: 'collect_client_phone',
          session_data: sessionData
        }, supabase);
      }
      break;

    case 'confirm_client':
      if (messageText === 'sim' || messageText === 's') {
        const sessionData = session.session_data;
        sessionData.client = sessionData.existing_client;
        
        await sendMessage(phoneNumber, 
          `📋 *Título da Proposta*\n\n` +
          `Digite o título/nome da proposta:`, 
          whatsappToken
        );
        await updateSession(phoneNumber, { 
          step: 'collect_proposal_title',
          session_data: sessionData
        }, supabase);
      } else {
        await sendMessage(phoneNumber, 
          `📱 Me informe o *telefone* do cliente:`, 
          whatsappToken
        );
        await updateSession(phoneNumber, { step: 'collect_client_phone' }, supabase);
      }
      break;

    case 'collect_client_phone':
      const sessionData2 = session.session_data || {};
      sessionData2.client_phone = messageText;
      
      await sendMessage(phoneNumber, 
        `📧 Agora me informe o *email* do cliente:`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_client_email',
        session_data: sessionData2
      }, supabase);
      break;

    case 'collect_client_email':
      const sessionData3 = session.session_data || {};
      sessionData3.client_email = messageText;
      
      await sendMessage(phoneNumber, 
        `📋 *Título da Proposta*\n\n` +
        `Digite o título/nome da proposta:`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_proposal_title',
        session_data: sessionData3
      }, supabase);
      break;

    case 'collect_proposal_title':
      const sessionData4 = session.session_data || {};
      sessionData4.proposal_title = messageText;
      
      await sendMessage(phoneNumber, 
        `📝 *Descrição do Serviço*\n\n` +
        `Descreva brevemente o serviço/produto:`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_service_description',
        session_data: sessionData4
      }, supabase);
      break;

    case 'collect_service_description':
      const sessionData5 = session.session_data || {};
      sessionData5.service_description = messageText;
      
      await sendMessage(phoneNumber, 
        `📋 *Descrição Detalhada*\n\n` +
        `Forneça uma descrição mais detalhada do que será entregue:`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_detailed_description',
        session_data: sessionData5
      }, supabase);
      break;

    case 'collect_detailed_description':
      const sessionData6 = session.session_data || {};
      sessionData6.detailed_description = messageText;
      
      await sendMessage(phoneNumber, 
        `💰 *Valor da Proposta*\n\n` +
        `Digite o valor (apenas números, ex: 1500.00):`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_value',
        session_data: sessionData6
      }, supabase);
      break;

    case 'collect_value':
      const sessionData7 = session.session_data || {};
      const value = parseFloat(messageText.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      if (isNaN(value)) {
        await sendMessage(phoneNumber, 
          `❌ Valor inválido. Digite apenas números (ex: 1500.00):`, 
          whatsappToken
        );
        return;
      }
      
      sessionData7.value = value;
      
      await sendMessage(phoneNumber, 
        `⏰ *Prazo de Entrega*\n\n` +
        `Digite o prazo de entrega (ex: "15 dias", "2 semanas"):`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_delivery_time',
        session_data: sessionData7
      }, supabase);
      break;

    case 'collect_delivery_time':
      const sessionData8 = session.session_data || {};
      sessionData8.delivery_time = messageText;
      
      await sendMessage(phoneNumber, 
        `📅 *Validade da Proposta*\n\n` +
        `Digite a data de validade (formato DD/MM/AAAA):`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_validity_date',
        session_data: sessionData8
      }, supabase);
      break;

    case 'collect_validity_date':
      const sessionData9 = session.session_data || {};
      sessionData9.validity_date = messageText;
      
      await sendMessage(phoneNumber, 
        `📝 *Observações (Opcional)*\n\n` +
        `Digite observações adicionais ou "pular" para continuar:`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { 
        step: 'collect_observations',
        session_data: sessionData9
      }, supabase);
      break;

    case 'collect_observations':
      const sessionData10 = session.session_data || {};
      if (messageText !== 'pular') {
        sessionData10.observations = messageText;
      }
      
      // Create proposal
      await createProposal(phoneNumber, sessionData10, user.user_id, supabase, whatsappToken);
      break;

    case 'send_proposal_id':
      await handleSendProposal(phoneNumber, messageText, user.user_id, supabase, whatsappToken);
      break;

    default:
      await sendMessage(phoneNumber, 
        `❌ Algo deu errado. Digite "menu" para voltar ao início.`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { step: 'start' }, supabase);
  }
}

async function createProposal(phoneNumber: string, sessionData: any, userId: string, supabase: any, whatsappToken: string) {
  try {
    // Create client if doesn't exist
    let clientId = sessionData.client?.id;
    
    if (!clientId) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{
          user_id: userId,
          name: sessionData.client_name,
          phone: sessionData.client_phone,
          email: sessionData.client_email
        }])
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }
      
      clientId = newClient.id;
    }

    // Create proposal
    const proposalData = {
      user_id: userId,
      client_id: clientId,
      title: sessionData.proposal_title,
      service_description: sessionData.service_description,
      detailed_description: sessionData.detailed_description,
      value: sessionData.value,
      delivery_time: sessionData.delivery_time,
      validity_date: sessionData.validity_date,
      observations: sessionData.observations || null,
      status: 'rascunho',
      template_id: 'moderno'
    };

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert([proposalData])
      .select()
      .single();

    if (proposalError) {
      throw proposalError;
    }

    await sendMessage(phoneNumber, 
      `✅ *Proposta Criada com Sucesso!*\n\n` +
      `*ID:* ${proposal.id}\n` +
      `*Título:* ${proposal.title}\n` +
      `*Cliente:* ${sessionData.client_name}\n` +
      `*Valor:* R$ ${proposal.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
      `Deseja enviar por email agora? (sim/não)`, 
      whatsappToken
    );

    await updateSession(phoneNumber, { 
      step: 'send_proposal_confirm',
      session_data: { proposal_id: proposal.id }
    }, supabase);

  } catch (error) {
    console.error('Error creating proposal:', error);
    await sendMessage(phoneNumber, 
      `❌ Erro ao criar proposta. Tente novamente.`, 
      whatsappToken
    );
    await updateSession(phoneNumber, { step: 'start' }, supabase);
  }
}

async function handleViewProposals(phoneNumber: string, userId: string, supabase: any, whatsappToken: string) {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        *,
        clients (
          name,
          email,
          phone
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    if (!proposals || proposals.length === 0) {
      await sendMessage(phoneNumber, 
        `📋 Você ainda não possui propostas cadastradas.`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { step: 'start' }, supabase);
      return;
    }

    let message = `📋 *Suas Últimas Propostas*\n\n`;
    
    proposals.forEach((proposal: any, index: number) => {
      const clientName = proposal.clients?.name || 'Cliente não informado';
      const value = proposal.value ? 
        `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
        'Valor não informado';
      const status = proposal.status || 'rascunho';
      const date = new Date(proposal.created_at).toLocaleDateString('pt-BR');
      
      message += `${index + 1}. *${proposal.title}*\n`;
      message += `   Cliente: ${clientName}\n`;
      message += `   Valor: ${value}\n`;
      message += `   Status: ${status}\n`;
      message += `   Data: ${date}\n`;
      message += `   ID: ${proposal.id}\n\n`;
    });

    message += `Digite "menu" para voltar ao menu principal.`;

    await sendMessage(phoneNumber, message, whatsappToken);
    await updateSession(phoneNumber, { step: 'start' }, supabase);

  } catch (error) {
    console.error('Error viewing proposals:', error);
    await sendMessage(phoneNumber, 
      `❌ Erro ao buscar propostas. Tente novamente.`, 
      whatsappToken
    );
    await updateSession(phoneNumber, { step: 'start' }, supabase);
  }
}

async function handleSendProposal(phoneNumber: string, proposalId: string, userId: string, supabase: any, whatsappToken: string) {
  try {
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        clients (
          name,
          email,
          phone
        )
      `)
      .eq('id', proposalId)
      .eq('user_id', userId)
      .single();

    if (error || !proposal) {
      await sendMessage(phoneNumber, 
        `❌ Proposta não encontrada. Verifique o ID.`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { step: 'start' }, supabase);
      return;
    }

    if (!proposal.clients?.email) {
      await sendMessage(phoneNumber, 
        `❌ Cliente não possui email cadastrado.`, 
        whatsappToken
      );
      await updateSession(phoneNumber, { step: 'start' }, supabase);
      return;
    }

    // Call send-proposal-email function
    const { data, error: emailError } = await supabase.functions.invoke('send-proposal-email', {
      body: {
        proposalId: proposal.id,
        recipientEmail: proposal.clients.email,
        recipientName: proposal.clients.name,
        emailSubject: `Proposta: ${proposal.title}`,
        emailMessage: `Olá ${proposal.clients.name},\n\nSegue em anexo a proposta solicitada.\n\nAtenciosamente,\nEquipe`,
        publicUrl: `${Deno.env.get('SUPABASE_URL')}/proposta/${proposal.public_hash || btoa(proposal.id)}`
      }
    });

    if (emailError) {
      throw emailError;
    }

    await sendMessage(phoneNumber, 
      `✅ *Proposta Enviada!*\n\n` +
      `A proposta "${proposal.title}" foi enviada para ${proposal.clients.email}`, 
      whatsappToken
    );

    await updateSession(phoneNumber, { step: 'start' }, supabase);

  } catch (error) {
    console.error('Error sending proposal:', error);
    await sendMessage(phoneNumber, 
      `❌ Erro ao enviar proposta. Tente novamente.`, 
      whatsappToken
    );
    await updateSession(phoneNumber, { step: 'start' }, supabase);
  }
}

async function handleClientFlow(phoneNumber: string, messageText: string, session: UserSession, supabase: any, whatsappToken: string) {
  console.log(`Handling client flow. Step: ${session.step}, Message: ${messageText}`);

  // Check if there are proposals for this phone number
  const { data: clientProposals } = await supabase
    .from('clients')
    .select(`
      *,
      proposals (
        id,
        title,
        status,
        public_hash,
        created_at
      )
    `)
    .eq('phone', phoneNumber)
    .limit(1);

  if (!clientProposals || clientProposals.length === 0) {
    await sendMessage(phoneNumber, 
      `👋 Olá! Não encontrei propostas para este número.\n\n` +
      `Se você é cliente e recebeu uma proposta, verifique se o número está correto.`, 
      whatsappToken
    );
    return;
  }

  const client = clientProposals[0];
  const recentProposals = client.proposals?.filter((p: any) => p.status === 'enviada') || [];

  if (recentProposals.length === 0) {
    await sendMessage(phoneNumber, 
      `📋 Olá ${client.name}!\n\n` +
      `Não há propostas pendentes para você no momento.`, 
      whatsappToken
    );
    return;
  }

  if (messageText === 'aceitar' || messageText === 'aceito') {
    await handleProposalResponse(phoneNumber, 'aceita', recentProposals[0].id, supabase, whatsappToken);
  } else if (messageText === 'recusar' || messageText === 'rejeitada') {
    await handleProposalResponse(phoneNumber, 'rejeitada', recentProposals[0].id, supabase, whatsappToken);
  } else {
    // Show proposal details
    const proposal = recentProposals[0];
    await sendMessage(phoneNumber, 
      `📋 *${proposal.title}*\n\n` +
      `Olá ${client.name}!\n\n` +
      `Você tem uma proposta pendente.\n\n` +
      `Para visualizar todos os detalhes, acesse: ` +
      `${Deno.env.get('SUPABASE_URL')}/proposta/${proposal.public_hash || btoa(proposal.id)}\n\n` +
      `Responda com:\n` +
      `• *aceitar* - para aceitar a proposta\n` +
      `• *recusar* - para recusar a proposta`, 
      whatsappToken
    );
  }
}

async function handleProposalResponse(phoneNumber: string, status: string, proposalId: string, supabase: any, whatsappToken: string) {
  try {
    const { error } = await supabase
      .from('proposals')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId);

    if (error) {
      throw error;
    }

    const statusText = status === 'aceita' ? 'aceita' : 'recusada';
    const emoji = status === 'aceita' ? '✅' : '❌';

    await sendMessage(phoneNumber, 
      `${emoji} *Proposta ${statusText}!*\n\n` +
      `Obrigado pela sua resposta. O responsável foi notificado.`, 
      whatsappToken
    );

  } catch (error) {
    console.error('Error updating proposal status:', error);
    await sendMessage(phoneNumber, 
      `❌ Erro ao processar resposta. Tente novamente.`, 
      whatsappToken
    );
  }
}

async function sendMessage(phoneNumber: string, message: string, whatsappToken: string) {
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!phoneNumberId) {
    console.error('WHATSAPP_PHONE_NUMBER_ID not configured');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: {
      body: message
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error sending WhatsApp message:', error);
    } else {
      console.log('Message sent successfully to:', phoneNumber);
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}
