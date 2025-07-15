
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();

    let systemPrompt = '';
    
    if (action === 'chat') {
      systemPrompt = `Você é um assistente especializado em criar propostas comerciais profissionais usando o modelo oficial da empresa.
      
      Seu objetivo é conversar com o usuário para entender completamente o projeto/serviço que ele quer propor e coletar todas as informações necessárias para criar uma proposta baseada no modelo oficial.
      
      Colete as seguintes informações de forma natural e conversacional:
      1. Nome/empresa do cliente
      2. Nome do responsável
      3. Email e telefone de contato
      4. Título/nome do serviço
      5. Descrição detalhada do serviço/produto
      6. Valor do projeto
      7. Prazo de entrega
      8. Forma de pagamento
      9. Observações especiais
      
      Seja amigável, profissional e faça perguntas inteligentes para entender o contexto do negócio.
      
      IMPORTANTE: Quando tiver coletado pelo menos as informações básicas (cliente, responsável, serviço, valor e prazo), 
      termine sua resposta com EXATAMENTE: "Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?"
      
      Essa frase específica irá ativar automaticamente um botão especial para gerar a proposta.`;
    } else if (action === 'generate') {
      systemPrompt = `Você é um especialista em gerar propostas comerciais estruturadas usando o modelo oficial da empresa.
      
      Analise CUIDADOSAMENTE toda a conversa anterior e extraia as informações específicas mencionadas pelo usuário.
      
      Use o modelo oficial fornecido e substitua apenas as informações específicas coletadas na conversa.
      
      MODELO OFICIAL:
      ${MODELO_OFICIAL}
      
      Retorne APENAS um JSON válido no seguinte formato, usando as informações EXATAS da conversa:
      
      {
        "titulo": "título específico mencionado pelo usuário ou nome do serviço",
        "cliente": "nome exato do cliente/empresa mencionado",
        "responsavel": "nome do responsável mencionado",
        "email": "email mencionado ou ''",
        "telefone": "telefone mencionado ou ''", 
        "servico": "nome específico do serviço mencionado",
        "descricao": "HTML completo usando o modelo oficial com as informações da conversa",
        "valor": "valor exato mencionado em formato numérico (sem R$)",
        "prazo": "prazo específico mencionado pelo usuário",
        "pagamento": "forma de pagamento mencionada ou 'A definir'",
        "observacoes": "observações específicas mencionadas ou observações padrão do modelo"
      }
      
      IMPORTANTE: 
      - Use APENAS informações que foram explicitamente mencionadas na conversa
      - Se uma informação não foi mencionada, use um valor padrão apropriado
      - Para o campo "descricao", use o modelo oficial HTML substituindo os placeholders com as informações coletadas
      - Para o valor, use apenas números (ex: 5400.00)
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
        max_tokens: action === 'generate' ? 2000 : 2000,
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
