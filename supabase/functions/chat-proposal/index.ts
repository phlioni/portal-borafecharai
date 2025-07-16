
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history } = await req.json();
    console.log('Dados recebidos:', { message, conversation_history });
    
    // Verificar se conversation_history é um array válido
    const messages = Array.isArray(conversation_history) ? conversation_history : [];
    
    let systemPrompt = `Você é um assistente especializado em criar propostas comerciais profissionais.

Seu objetivo é conversar com o usuário para entender completamente o projeto/serviço que ele quer propor e coletar todas as informações necessárias para criar uma proposta padronizada.

Colete as seguintes informações de forma natural e conversacional:
1. Título do projeto/serviço
2. Nome/empresa do cliente  
3. Email e telefone de contato do cliente (se disponível)
4. Descrição resumida do serviço/produto
5. Descrição detalhada do que será entregue
6. Valor da proposta
7. Prazo de entrega
8. Observações especiais (condições de pagamento, garantias, etc.)

Seja amigável, profissional e faça perguntas inteligentes para entender o contexto do negócio.

IMPORTANTE: Quando tiver coletado pelo menos as informações principais (título, cliente, serviço, valor e prazo), 
termine sua resposta com EXATAMENTE esta frase: "Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?"

Essa frase específica irá ativar automaticamente um botão especial para gerar a proposta.`;

    // Preparar mensagens para o OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: message }
    ];

    console.log('Enviando para OpenAI:', openAIMessages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Resposta do OpenAI:', assistantMessage);

    // Verificar se deve mostrar o botão de gerar proposta
    const showGenerateButton = assistantMessage.includes("Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?");

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      show_generate_button: showGenerateButton
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-proposal function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Desculpe, ocorreu um erro. Pode tentar novamente?'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
