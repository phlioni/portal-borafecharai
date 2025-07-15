
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Telegram } from 'https://deno.land/x/telegram@v0.0.3/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!telegramBotToken || !supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  Deno.exit(1);
}

const telegram = new Telegram(telegramBotToken);
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

let userId: string | null = null;
let userName: string | null = null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODELO_OFICIAL = `<h1>Proposta Comercial para {servico}</h1>

<p><strong>Número da proposta:</strong> {numero_proposta}</p>
<p><strong>Data:</strong> {data}</p>

<h2>Destinatário</h2>
<p><strong>Cliente:</strong> {cliente}</p>
<p><strong>Responsável:</strong> {responsavel}</p>
<p><strong>Contato:</strong> {email} / {telefone}</p>

<h2>Introdução</h2>
<p>Prezada(o) {responsavel},</p>
<p>Agradecemos a oportunidade de apresentar esta proposta para atender às suas necessidades com relação a <strong>{servico}</strong>. Nosso compromisso é oferecer um serviço de alta qualidade, com foco em resultados e em um relacionamento transparente e duradouro.</p>

<h2>Escopo dos Serviços</h2>
<ul>
  <li>Análise inicial do cenário do cliente</li>
  <li>Planejamento e definição do cronograma</li>
  <li>Implementação dos serviços conforme escopo</li>
  <li>Treinamento da equipe (se aplicável)</li>
  <li>Suporte por {dias_suporte} dias após entrega</li>
</ul>

<p><strong>O que não está incluso:</strong></p>
<ul>
  <li>Custos de terceiros (viagens, licenças, etc.)</li>
  <li>Serviços fora do escopo desta proposta</li>
</ul>

<h2>Prazos</h2>
<p>O prazo estimado para execução dos serviços é de <strong>{prazo}</strong>, contados a partir da assinatura desta proposta e pagamento do sinal (se houver).</p>

<h2>Investimento</h2>
<p><strong>Valor total:</strong> R$ {valor}</p>
<p><strong>Forma de pagamento:</strong> {pagamento}</p>
<p><strong>Vencimento:</strong> {vencimento}</p>

<h2>Condições Gerais</h2>
<ul>
  <li>Validade da proposta: {validade} dias</li>
  <li>Eventuais alterações no escopo poderão impactar prazo e valores</li>
  <li>Rescisão, multas, ou regras para cancelamento conforme contrato</li>
</ul>`;

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Received Telegram update:', update);

    if (!update.message && !update.callback_query) {
      console.log('Ignoring non-message update');
      return new Response('Ignoring non-message update');
    }

    let chatId: number;
    let text: string | undefined;
    let from: any;
    let messageId: number | undefined;

    if (update.message) {
      chatId = update.message.chat.id;
      text = update.message.text;
      from = update.message.from;
      messageId = update.message.message_id;
    } else if (update.callback_query) {
      chatId = update.callback_query.message.chat.id;
      text = update.callback_query.data;
      from = update.callback_query.from;
      messageId = update.callback_query.message.message_id;
    } else {
      console.error('Unknown update type');
      return new Response('Unknown update type');
    }

    console.log(`Received message "${text}" from chat ID ${chatId}`);

    const sendMessage = async (chat_id: number, text: string, reply_markup: any = null) => {
      try {
        const payload: any = {
          chat_id: chat_id,
          text: text,
          parse_mode: 'Markdown'
        };

        if (reply_markup) {
          payload.reply_markup = reply_markup;
        }

        const response = await telegram.sendMessage(payload);
        console.log('Sent message:', response);
        return response;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    };

    // Verificar se existe um usuário com este telefone na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name')
      .eq('phone', from.id.toString())
      .single();

    if (profileError || !profileData) {
      await sendMessage(chatId, 
        `Olá! Para usar o bot, você precisa primeiro se cadastrar no sistema com este número de telefone (${from.id}). ` +
        `Acesse o sistema e cadastre-se usando este telefone.`
      );
      return new Response('OK');
    }

    userId = profileData.user_id;
    userName = profileData.name || from.first_name || 'Usuário';

    // Carregar sessão
    let { data: session, error: sessionError } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('chat_id', chatId)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Error fetching session:', sessionError);
      await sendMessage(chatId, 'Erro ao carregar sessão. Tente novamente.');
      return new Response('Error fetching session');
    }

    // Se não existe, criar nova sessão
    if (!session) {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .insert({
          chat_id: chatId,
          user_id: userId,
          step: 'start',
          session_data: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        await sendMessage(chatId, 'Erro ao criar sessão. Tente novamente.');
        return new Response('Error creating session');
      }

      session = data;
      console.log('New session created:', session);
      await sendMessage(chatId, `Olá, ${userName}! Vamos criar uma proposta juntos! Qual o nome do seu cliente?`);
      return new Response('OK');
    }

    console.log('Session data:', session);

    // Função para atualizar a sessão
    const updateSession = async (updates: any) => {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .update(updates)
        .eq('chat_id', chatId)
        .select()
        .single();

      if (error) {
        console.error('Error updating session:', error);
        await sendMessage(chatId, 'Erro ao atualizar sessão. Tente novamente.');
        return false;
      }

      console.log('Session updated:', data);
      session = data;
      return true;
    };

    // Função para limpar a sessão
    const clearSession = async () => {
      const { error } = await supabase
        .from('telegram_sessions')
        .delete()
        .eq('chat_id', chatId);

      if (error) {
        console.error('Error deleting session:', error);
        await sendMessage(chatId, 'Erro ao limpar sessão. Tente novamente.');
        return false;
      }

      console.log('Session cleared');
      return true;
    };

    // Função para validar valor
    const isValidValue = (value: string) => {
      const regex = /^\d+(\,\d{3})*(\,\d{2})?$/;
      return regex.test(value);
    };

    // Função para formatar valor
    const formatValue = (value: string) => {
      return value.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
    };

    // Handle callback queries
    if (update.callback_query) {
      const callbackData = update.callback_query.data;

      if (callbackData === 'new_proposal') {
        await clearSession();
        await sendMessage(chatId, `Ok, vamos começar uma nova proposta! Qual o nome do seu cliente?`);
        return new Response('OK');
      }

      if (callbackData === 'finish') {
        await clearSession();
        await sendMessage(chatId, 'Ok, finalizando! Se precisar de algo mais, é só chamar!');
        return new Response('OK');
      }

      if (callbackData.startsWith('send_email_')) {
        const proposalId = callbackData.split('_')[2];
        console.log('Sending email for proposal ID:', proposalId);
        
        try {
          // Buscar dados da proposta
          const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .select('*')
            .eq('id', proposalId)
            .single();

          if (proposalError || !proposal) {
            console.error('Error fetching proposal:', proposalError);
            await sendMessage(chatId, 'Erro ao buscar proposta. Tente novamente mais tarde.');
            return new Response('OK');
          }

          // Buscar dados da empresa do usuário
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (companyError || !company) {
            console.error('Error fetching company:', companyError);
            await sendMessage(chatId, 'Erro: É necessário ter uma empresa cadastrada para enviar propostas por e-mail.');
            return new Response('OK');
          }

          // Chamar função de envio de e-mail
          const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-proposal-email', {
            body: {
              proposal_id: proposalId,
              recipient_email: session.session_data.email || company.email || 'cliente@exemplo.com',
              recipient_name: session.session_data.client || 'Cliente',
              sender_name: userName || company.name || 'Equipe Comercial',
              sender_email: company.email || 'comercial@borafecharai.com'
            }
          });

          if (emailError) {
            console.error('Error sending email:', emailError);
            await sendMessage(chatId, 'Erro ao enviar e-mail. Verifique se o endereço está correto e tente novamente.');
          } else {
            console.log('Email sent successfully:', emailResponse);
            await sendMessage(chatId, '✅ E-mail enviado com sucesso! O cliente receberá a proposta em breve.');
          }
        } catch (error) {
          console.error('Error in email sending process:', error);
          await sendMessage(chatId, 'Erro interno ao enviar e-mail. Tente novamente mais tarde.');
        }
        
        return new Response('OK');
      }
    }

    // Update handleCreateProposal function to use the new official model
    async function handleCreateProposal(chatId: number, sessionData: any) {
      try {
        console.log('Creating proposal with data:', sessionData);
        
        // Substituir placeholders no modelo oficial
        let proposalContent = MODELO_OFICIAL;
        const today = new Date();
        const proposalNumber = `PROP-${Date.now()}`;
        
        // Substituições básicas
        const replacements = {
          '{servico}': sessionData.service || 'Serviço',
          '{numero_proposta}': proposalNumber,
          '{data}': today.toLocaleDateString('pt-BR'),
          '{cliente}': sessionData.client || 'Cliente',
          '{responsavel}': sessionData.client || 'Responsável',
          '{email}': sessionData.email || 'email@exemplo.com',
          '{telefone}': sessionData.phone || '(11) 99999-9999',
          '{prazo}': sessionData.deadline || '30 dias',
          '{valor}': sessionData.value || '0,00',
          '{pagamento}': sessionData.payment || 'A definir',
          '{vencimento}': 'A definir',
          '{dias_suporte}': '30',
          '{validade}': '30'
        };
        
        // Aplicar todas as substituições
        for (const [placeholder, value] of Object.entries(replacements)) {
          proposalContent = proposalContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
        
        // Salvar proposta no banco
        const { data: proposal, error: proposalError } = await supabase
          .from('proposals')
          .insert({
            user_id: userId,
            title: sessionData.service || 'Proposta via Telegram',
            service_description: sessionData.service || '',
            detailed_description: proposalContent,
            value: parseFloat(sessionData.value?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            delivery_time: sessionData.deadline || '',
            observations: sessionData.observations || '',
            template_id: 'moderno'
          })
          .select()
          .single();

        if (proposalError) {
          console.error('Error creating proposal:', proposalError);
          await sendMessage(chatId, 'Erro ao criar proposta. Tente novamente.');
          return;
        }

        console.log('Proposal created successfully:', proposal.id);
        
        // Preparar link público
        const proposalUrl = `https://preview--proposta-inteligente-brasil.lovable.app/proposta/${proposal.public_hash}`;
        
        const successMessage = `✅ *Proposta criada com sucesso!*

📋 *Resumo:*
• *Cliente:* ${sessionData.client}
• *Serviço:* ${sessionData.service}
• *Valor:* R$ ${sessionData.value}
• *Prazo:* ${sessionData.deadline}

🔗 *Link da proposta:* ${proposalUrl}

*O que você gostaria de fazer agora?*`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '📧 Enviar por E-mail', callback_data: `send_email_${proposal.id}` }],
            [{ text: '📋 Nova Proposta', callback_data: 'new_proposal' }],
            [{ text: '❌ Finalizar', callback_data: 'finish' }]
          ]
        };

        await sendMessage(chatId, successMessage, keyboard);
        
        // Limpar sessão mas manter para ações pós-criação
        await supabase
          .from('telegram_sessions')
          .update({
            step: 'proposal_actions',
            session_data: { ...sessionData, proposal_id: proposal.id }
          })
          .eq('chat_id', chatId);

      } catch (error) {
        console.error('Error in handleCreateProposal:', error);
        await sendMessage(chatId, 'Erro interno ao criar proposta. Tente novamente.');
      }
    }

    // Lógica principal da conversa
    if (session.step === 'start') {
      if (!text) {
        await sendMessage(chatId, 'Por favor, digite o nome do cliente.');
        return new Response('OK');
      }

      const clientName = text;
      if (!await updateSession({ step: 'service', session_data: { client: clientName } })) {
        return new Response('Error updating session');
      }

      await sendMessage(chatId, `Ok, qual o serviço que você vai oferecer para ${clientName}?`);
    } else if (session.step === 'service') {
      if (!text) {
        await sendMessage(chatId, 'Por favor, digite o nome do serviço.');
        return new Response('OK');
      }

      const serviceName = text;
      if (!await updateSession({ step: 'value', session_data: { ...session.session_data, service: serviceName } })) {
        return new Response('Error updating session');
      }

      await sendMessage(chatId, `Certo, qual o valor total desse serviço? (Ex: 1000,00)`);
    } else if (session.step === 'value') {
      if (!text || !isValidValue(text)) {
        await sendMessage(chatId, 'Por favor, digite um valor válido (Ex: 1000,00).');
        return new Response('OK');
      }

      const serviceValue = text;
      if (!await updateSession({ step: 'deadline', session_data: { ...session.session_data, value: serviceValue } })) {
        return new Response('Error updating session');
      }

      await sendMessage(chatId, `Qual o prazo de entrega desse serviço?`);
    } else if (session.step === 'deadline') {
      if (!text) {
        await sendMessage(chatId, 'Por favor, digite o prazo de entrega.');
        return new Response('OK');
      }

      const deadline = text;
      if (!await updateSession({ step: 'confirm', session_data: { ...session.session_data, deadline: deadline } })) {
        return new Response('Error updating session');
      }

      const confirmMessage = `Confirme os dados da proposta:

Cliente: ${session.session_data.client}
Serviço: ${session.session_data.service}
Valor: R$ ${session.session_data.value}
Prazo: ${deadline}

Tudo certo? (sim/não)`;

      await sendMessage(chatId, confirmMessage);
    } else if (session.step === 'confirm') {
      if (text?.toLowerCase() === 'sim') {
        await handleCreateProposal(chatId, session.session_data);
      } else {
        await sendMessage(chatId, 'Ok, vamos recomeçar! Qual o nome do seu cliente?');
        await updateSession({ step: 'start', session_data: {} });
      }
    } else if (session.step === 'proposal_actions') {
      console.log('Handling proposal actions');
      return new Response('OK');
    }

    return new Response('OK');
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return new Response('Error processing Telegram webhook');
  }
});
