
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
    const { businessType, serviceType, targetAudience, tone } = await req.json();
    
    // Obter informações do usuário autenticado
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário pode criar propostas
    const { data: canCreate, error: limitError } = await supabase.rpc('can_create_proposal', {
      _user_id: user.id
    });

    if (limitError) {
      console.error('Erro ao verificar limite:', limitError);
      throw new Error('Erro ao verificar limite de propostas');
    }

    if (!canCreate) {
      // Buscar informações sobre o limite atual
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyCount } = await supabase.rpc('get_monthly_proposal_count', {
        _user_id: user.id,
        _month: currentMonth
      });

      // Verificar se é trial ou usuário básico
      const { data: subscriberData } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, trial_end_date')
        .eq('user_id', user.id)
        .maybeSingle();

      const isInTrial = subscriberData?.trial_end_date && new Date(subscriberData.trial_end_date) > new Date();
      const limit = isInTrial ? 20 : 10;

      return new Response(JSON.stringify({ 
        error: `Limite de ${limit} propostas por mês atingido. Você já criou ${monthlyCount || 0} propostas este mês. Faça upgrade para o plano Professional para ter propostas ilimitadas.`,
        limitReached: true,
        used: monthlyCount || 0,
        limit: limit
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
          {
            role: 'system',
            content: `Você é um especialista em criar propostas comerciais em português brasileiro. 
            
            Use SEMPRE o modelo oficial fornecido como base, mantendo sua estrutura e formato HTML.
            
            Substitua apenas os placeholders com conteúdo apropriado baseado nas informações fornecidas pelo usuário.
            
            MODELO OFICIAL A SER USADO:
            ${MODELO_OFICIAL}
            
            Mantenha todos os placeholders {variavel} intactos - eles serão substituídos posteriormente pelo sistema.`
          },
          {
            role: 'user',
            content: `Crie um template de proposta comercial usando o modelo oficial fornecido com as seguintes características:
            - Tipo de negócio: ${businessType}
            - Tipo de serviço: ${serviceType}
            - Público-alvo: ${targetAudience}
            - Tom: ${tone}
            
            Personalize apenas o conteúdo descritivo mantendo a estrutura e placeholders do modelo oficial.
            
            Retorne APENAS um JSON com a estrutura:
            {
              "title": "título da proposta",
              "service_description": "descrição breve do serviço",
              "detailed_description": "conteúdo HTML completo usando o modelo oficial",
              "observations": "observações específicas para este tipo de serviço"
            }`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      try {
        const templateData = JSON.parse(data.choices[0].message.content);
        
        // Garantir que o detailed_description usa o modelo oficial
        if (!templateData.detailed_description || !templateData.detailed_description.includes('Proposta Comercial para {servico}')) {
          templateData.detailed_description = MODELO_OFICIAL;
        }
        
        return new Response(JSON.stringify(templateData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        // Fallback usando o modelo oficial
        const fallbackTemplate = {
          title: `Proposta Comercial para ${serviceType}`,
          service_description: `Serviços especializados em ${serviceType} para ${targetAudience}`,
          detailed_description: MODELO_OFICIAL,
          observations: "Esta proposta tem validade de 30 dias. Valores podem sofrer alterações sem aviso prévio. Início dos trabalhos mediante aprovação e pagamento da primeira parcela."
        };
        
        return new Response(JSON.stringify(fallbackTemplate), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Resposta inválida da API');

  } catch (error) {
    console.error('Erro ao gerar template:', error);
    
    // Se for erro de limite, retornar erro específico
    if (error.message && error.message.includes('Limite de')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Fallback com modelo oficial para outros erros
    const fallbackTemplate = {
      title: "Proposta Comercial",
      service_description: "Descrição do serviço",
      detailed_description: MODELO_OFICIAL,
      observations: "Esta proposta tem validade de 30 dias."
    };
    
    return new Response(JSON.stringify(fallbackTemplate), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
