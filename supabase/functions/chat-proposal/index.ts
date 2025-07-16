
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
    const { messages, action, user_id } = await req.json();
    
    // Inicializar cliente Supabase se necessário
    const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

    let systemPrompt = '';
    
    if (action === 'chat') {
      systemPrompt = `Você é um assistente especializado em criar propostas comerciais profissionais.
      
      Seu objetivo é conversar com o usuário para entender completamente o projeto/serviço que ele quer propor e coletar todas as informações necessárias para criar uma proposta padronizada.
      
      Colete as seguintes informações de forma natural e conversacional:
      1. Nome/empresa do cliente
      2. Nome do responsável
      3. Email e telefone de contato (se disponível)
      4. Título/nome do serviço
      5. Descrição detalhada do serviço/produto
      6. Prazo de entrega
      7. IMPORTANTE: Sempre colete itens de orçamento detalhado com:
         - Itens de materiais (descrição, quantidade, valor unitário)
         - Itens de mão de obra (descrição, quantidade, valor unitário)
      8. Observações especiais
      9. Forma de pagamento (à vista, parcelado, etc.)
      
      Seja amigável, profissional e faça perguntas inteligentes para entender o contexto do negócio.
      
      IMPORTANTE: Quando tiver coletado pelo menos as informações principais (cliente, responsável, serviço, itens de orçamento e prazo), 
      termine sua resposta com EXATAMENTE: "Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?"
      
      Essa frase específica irá ativar automaticamente um botão especial para gerar a proposta.`;
    } else if (action === 'generate') {
      // Buscar dados de clientes existentes se o usuário foi fornecido
      let clientData = null;
      if (supabase && user_id) {
        try {
          // Extrair informações de cliente das mensagens para buscar no banco
          const conversationText = messages.map((msg: any) => msg.content).join(' ');
          
          // Buscar empresas/clientes cadastrados pelo usuário
          const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user_id);
          
          if (companies && companies.length > 0) {
            // Tentar encontrar correspondência com base no nome mencionado na conversa
            for (const company of companies) {
              if (company.name && conversationText.toLowerCase().includes(company.name.toLowerCase())) {
                clientData = company;
                break;
              }
              if (company.email && conversationText.toLowerCase().includes(company.email.toLowerCase())) {
                clientData = company;
                break;
              }
              if (company.phone && conversationText.includes(company.phone)) {
                clientData = company;
                break;
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados do cliente:', error);
        }
      }

      systemPrompt = `Você é um especialista em gerar propostas comerciais estruturadas.
      
      Analise CUIDADOSAMENTE toda a conversa anterior e extraia as informações específicas mencionadas pelo usuário.
      
      ${clientData ? `DADOS DO CLIENTE ENCONTRADOS NO BANCO:
      - Nome: ${clientData.name}
      - Email: ${clientData.email || ''}
      - Telefone: ${clientData.phone || ''}
      - Endereço: ${clientData.address || ''}
      - Cidade: ${clientData.city || ''}
      - Estado: ${clientData.state || ''}
      
      Use estes dados como base e complete com as informações da conversa.` : ''}
      
      IMPORTANTE: A proposta seguirá um padrão único e padronizado. O valor total será calculado automaticamente com base nos itens de serviços e materiais.
      
      Retorne APENAS um JSON válido no seguinte formato, usando as informações EXATAS da conversa e dados do cliente:
      
      {
        "titulo": "título específico mencionado pelo usuário ou nome do serviço",
        "cliente": "${clientData?.name || 'nome exato do cliente/empresa mencionado'}",
        "responsavel": "nome do responsável mencionado",
        "email": "${clientData?.email || 'email mencionado ou \'\''}",
        "telefone": "${clientData?.phone || 'telefone mencionado ou \'\''}",
        "servico": "nome específico do serviço mencionado",
        "descricao": "descrição detalhada do serviço/projeto",
        "prazo": "prazo específico mencionado pelo usuário",
        "observacoes": "observações específicas mencionadas ou ''",
        "forma_pagamento": "forma de pagamento mencionada ou 'À vista'",
        "budget_items": [
          {
            "type": "material" ou "labor",
            "description": "descrição do item",
            "quantity": número,
            "unit_price": número
          }
        ]
      }
      
      IMPORTANTE: 
      - Use APENAS informações que foram explicitamente mencionadas na conversa
      - Se uma informação não foi mencionada, use os dados do cliente ou uma string vazia ''
      - SEMPRE inclua os itens de orçamento no array "budget_items"
      - Seja específico e preciso com as informações extraídas
      - O valor total será calculado automaticamente pelo sistema com base nos itens
      
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
