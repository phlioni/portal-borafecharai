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
    const { businessType, serviceType, targetAudience, tone } = await req.json();

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
            content: `Você é um especialista em criar templates de propostas comerciais em português brasileiro. Crie templates profissionais que sejam persuasivos e adequados ao mercado brasileiro.`
          },
          {
            role: 'user',
            content: `Crie um template de proposta comercial com as seguintes características:
            - Tipo de negócio: ${businessType}
            - Tipo de serviço: ${serviceType}
            - Público-alvo: ${targetAudience}
            - Tom: ${tone}
            
            O template deve incluir:
            1. Um título atrativo
            2. Uma descrição breve do serviço
            3. Uma descrição detalhada explicando os benefícios
            4. Observações importantes (termos, garantias, etc.)
            
            Retorne APENAS um JSON com a estrutura:
            {
              "title": "título da proposta",
              "service_description": "descrição breve",
              "detailed_description": "descrição detalhada com benefícios",
              "observations": "observações importantes"
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
        return new Response(JSON.stringify(templateData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        // Se não conseguir fazer parse do JSON, retorna um template padrão
        const fallbackTemplate = {
          title: `Proposta de ${serviceType} para ${businessType}`,
          service_description: `Serviços especializados em ${serviceType} para ${targetAudience}`,
          detailed_description: `Nossa empresa oferece soluções completas em ${serviceType} especialmente desenvolvidas para ${businessType}. Com uma abordagem ${tone}, garantimos resultados excepcionais que atendem às necessidades específicas do seu negócio.`,
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});