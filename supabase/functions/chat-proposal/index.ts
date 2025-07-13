
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();

    let systemPrompt = '';
    
    if (action === 'chat') {
      systemPrompt = `Você é um assistente especializado em criar propostas comerciais profissionais. 
      
      Seu objetivo é conversar com o usuário para entender completamente o projeto/serviço que ele quer propor e coletar todas as informações necessárias para criar uma proposta.
      
      Colete as seguintes informações de forma natural e conversacional:
      1. Nome/empresa do cliente
      2. Título/nome do projeto
      3. Descrição detalhada do serviço/produto
      4. Valor do projeto
      5. Prazo de entrega
      6. Observações especiais
      
      Seja amigável, profissional e faça perguntas inteligentes para entender o contexto do negócio.
      
      IMPORTANTE: Quando tiver coletado pelo menos as informações básicas (cliente, serviço, valor e prazo), 
      termine sua resposta com EXATAMENTE: "Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?"
      
      Essa frase específica irá ativar automaticamente um botão especial para gerar a proposta.`;
    } else if (action === 'generate') {
      systemPrompt = `Você é um especialista em gerar propostas comerciais estruturadas.
      
      Analise CUIDADOSAMENTE toda a conversa anterior e extraia as informações específicas mencionadas pelo usuário.
      
      Retorne APENAS um JSON válido no seguinte formato, usando as informações EXATAS da conversa:
      
      {
        "titulo": "título específico mencionado pelo usuário ou 'Proposta para [nome do serviço/projeto]'",
        "cliente": "nome exato do cliente/empresa mencionado",
        "email": "email mencionado ou ''",
        "telefone": "telefone mencionado ou ''", 
        "servico": "resumo do serviço/produto específico mencionado",
        "descricao": "descrição detalhada do que será entregue baseada exatamente no que foi conversado",
        "valor": "valor exato mencionado em formato R$ X.XXX,XX",
        "prazo": "prazo específico mencionado pelo usuário",
        "observacoes": "observações específicas mencionadas ou ''"
      }
      
      IMPORTANTE: 
      - Use APENAS informações que foram explicitamente mencionadas na conversa
      - Se uma informação não foi mencionada, use um valor vazio ou padrão apropriado
      - NÃO invente dados que não foram discutidos
      - Para o valor, sempre use formato brasileiro (R$ 1.000,00)
      - Seja específico e preciso com as informações extraídas
      
      Certifique-se de que o JSON seja válido e contenha todas as informações extraídas da conversa.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: action === 'generate' ? 0.0 : 0.7,
        max_tokens: action === 'generate' ? 1000 : 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-proposal function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
