
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const resendApiKey = Deno.env.get('RESEND_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('Request body received:', requestBody)

    const { 
      proposalId, 
      recipientEmail, 
      recipientName, 
      emailSubject, 
      emailMessage, 
      publicUrl 
    } = requestBody

    console.log('Enviando proposta por email:', { 
      proposalId, 
      recipientEmail, 
      recipientName, 
      emailSubject 
    })

    // Buscar proposta com todos os dados necessários (igual ao preview)
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        ),
        proposal_budget_items (
          id,
          description,
          quantity,
          unit_price,
          total_price,
          type
        )
      `)
      .eq('id', proposalId)
      .single()

    if (proposalError) {
      console.error('Erro ao buscar proposta:', proposalError)
      return new Response(
        JSON.stringify({ error: 'Proposta não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar informações da empresa do usuário na tabela user_companies
    const { data: userCompanyData, error: userCompanyError } = await supabase
      .from('user_companies')
      .select('*')
      .eq('user_id', proposal.user_id)
      .maybeSingle()

    if (userCompanyError) {
      console.error('Erro ao buscar empresa do usuário:', userCompanyError)
    }

    // Buscar informações do perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', proposal.user_id)
      .maybeSingle()

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError)
    }

    // Compor a proposta completa com as informações adicionais
    const completeProposal = {
      ...proposal,
      user_companies: userCompanyData,
      user_profile: profileData
    }

    // Garantir que existe um hash público válido
    let finalPublicHash = proposal.public_hash
    if (!finalPublicHash || finalPublicHash.length < 16) {
      console.log('Gerando novo hash público para a proposta')
      const encoder = new TextEncoder()
      const data = encoder.encode(`${proposalId}-${Date.now()}-${Math.random()}`)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      finalPublicHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
      
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ 
          public_hash: finalPublicHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        
      if (updateError) {
        console.error('Erro ao atualizar hash público:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao gerar link da proposta' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const finalPublicUrl = `https://www.borafecharai.com/proposta/${finalPublicHash}`
    console.log('URL final da proposta:', finalPublicUrl)

    // Funções auxiliares para o template (iguais ao StandardProposalTemplate)
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('pt-BR');
      } catch {
        return dateString;
      }
    };

    const calculateTotal = () => {
      if (completeProposal?.proposal_budget_items?.length) {
        return completeProposal.proposal_budget_items.reduce((total: number, item: any) => {
          return total + (item.total_price || (item.quantity * item.unit_price));
        }, 0);
      }
      return completeProposal?.value || 0;
    };

    const logoUrl = completeProposal?.user_companies?.logo_url || completeProposal?.companies?.logo_url;

    // Gerar HTML da proposta usando o mesmo template do preview
    const generateProposalHTML = () => {
      return `
        <div style="background-color: white; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div style="flex: 1;">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo da empresa" style="height: 64px; width: auto; margin-bottom: 16px;" />` : ''}
              <div>
                <h1 style="font-size: 32px; font-weight: bold; color: #111827; margin: 0 0 8px 0;">PROPOSTA COMERCIAL</h1>
                ${completeProposal?.proposal_number ? `<p style="font-size: 18px; color: #6B7280; font-weight: 500; margin: 0;">Nº ${completeProposal.proposal_number}</p>` : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 14px; color: #6B7280; margin: 0;">Data: ${formatDate(completeProposal?.created_at || new Date().toISOString())}</p>
              ${completeProposal?.validity_date ? `<p style="font-size: 14px; color: #6B7280; margin: 4px 0 0 0;">Validade: ${formatDate(completeProposal.validity_date)}</p>` : ''}
            </div>
          </div>

          <!-- Company Info -->
          ${(completeProposal?.user_companies || completeProposal?.companies || completeProposal?.user_profile) ? `
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Dados da Empresa</h2>
            <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px;">
              ${(completeProposal?.user_companies || completeProposal?.companies) ? `
              <div>
                <p style="font-weight: 600; margin: 0 0 8px 0;">${(completeProposal?.user_companies || completeProposal?.companies)?.name}</p>
                ${(completeProposal?.user_companies || completeProposal?.companies)?.email ? `<p style="margin: 0 0 4px 0;">Email: ${(completeProposal?.user_companies || completeProposal?.companies)?.email}</p>` : ''}
                ${(completeProposal?.user_companies || completeProposal?.companies)?.phone ? `<p style="margin: 0 0 4px 0;">Telefone: ${(completeProposal?.user_companies || completeProposal?.companies)?.phone}</p>` : ''}
                ${(completeProposal?.user_companies || completeProposal?.companies)?.address ? `<p style="margin: 0 0 4px 0;">Endereço: ${(completeProposal?.user_companies || completeProposal?.companies)?.address}${(completeProposal?.user_companies || completeProposal?.companies)?.city ? `, ${(completeProposal?.user_companies || completeProposal?.companies)?.city}` : ''}${(completeProposal?.user_companies || completeProposal?.companies)?.state ? ` - ${(completeProposal?.user_companies || completeProposal?.companies)?.state}` : ''}</p>` : ''}
                ${(completeProposal?.user_companies || completeProposal?.companies)?.cnpj ? `<p style="margin: 0;">CNPJ: ${(completeProposal?.user_companies || completeProposal?.companies)?.cnpj}</p>` : ''}
              </div>
              ` : ''}
              ${completeProposal?.user_profile && !(completeProposal?.user_companies || completeProposal?.companies) ? `
              <div>
                <p style="font-weight: 600; margin: 0 0 8px 0;">${completeProposal.user_profile.name}</p>
                ${completeProposal.user_profile.phone ? `<p style="margin: 0;">Telefone: ${completeProposal.user_profile.phone}</p>` : ''}
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Client Info -->
          ${completeProposal?.clients ? `
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Cliente</h2>
            <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px;">
              <p style="font-weight: 600; margin: 0 0 8px 0;">${completeProposal.clients.name}</p>
              ${completeProposal.clients.email ? `<p style="margin: 0 0 4px 0;">Email: ${completeProposal.clients.email}</p>` : ''}
              ${completeProposal.clients.phone ? `<p style="margin: 0;">Telefone: ${completeProposal.clients.phone}</p>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Proposal Title -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">${completeProposal?.title}</h2>
          </div>

          <!-- Service Description -->
          ${completeProposal?.service_description ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Resumo do Serviço</h3>
            <p style="color: #374151; line-height: 1.6; margin: 0;">${completeProposal.service_description}</p>
          </div>
          ` : ''}

          <!-- Detailed Description -->
          ${completeProposal?.detailed_description ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Descrição Detalhada</h3>
            <div style="color: #374151; line-height: 1.6; white-space: pre-wrap; margin: 0;">${completeProposal.detailed_description}</div>
          </div>
          ` : ''}

          <!-- Budget Items -->
          ${completeProposal?.proposal_budget_items && completeProposal.proposal_budget_items.length > 0 ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Itens do Orçamento</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #D1D5DB;">
              <thead>
                <tr style="background-color: #F3F4F6;">
                  <th style="border: 1px solid #D1D5DB; padding: 12px; text-align: left;">Tipo</th>
                  <th style="border: 1px solid #D1D5DB; padding: 12px; text-align: left;">Descrição</th>
                  <th style="border: 1px solid #D1D5DB; padding: 12px; text-align: center;">Qtd</th>
                  <th style="border: 1px solid #D1D5DB; padding: 12px; text-align: right;">Valor Unit.</th>
                  <th style="border: 1px solid #D1D5DB; padding: 12px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${completeProposal.proposal_budget_items.map((item: any) => `
                <tr>
                  <td style="border: 1px solid #D1D5DB; padding: 12px;">${item.type}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 12px;">${item.description}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: right;">${formatCurrency(item.unit_price)}</td>
                  <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: right;">${formatCurrency(item.total_price || (item.quantity * item.unit_price))}</td>
                </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #F3F4F6; font-weight: 600;">
                  <td colspan="4" style="border: 1px solid #D1D5DB; padding: 12px; text-align: right;">Total Geral:</td>
                  <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: right;">${formatCurrency(calculateTotal())}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          ` : ''}

          <!-- Value (if no budget items) -->
          ${(!completeProposal?.proposal_budget_items || completeProposal.proposal_budget_items.length === 0) && completeProposal?.value ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Valor</h3>
            <div style="background-color: #EFF6FF; padding: 16px; border-radius: 8px;">
              <p style="font-size: 32px; font-weight: bold; color: #1D4ED8; margin: 0;">${formatCurrency(completeProposal.value)}</p>
            </div>
          </div>
          ` : ''}

          <!-- Delivery Time -->
          ${completeProposal?.delivery_time ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Prazo de Entrega</h3>
            <p style="color: #374151; margin: 0;">${completeProposal.delivery_time}</p>
          </div>
          ` : ''}

          <!-- Observations -->
          ${completeProposal?.observations ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Observações</h3>
            <div style="color: #374151; line-height: 1.6; white-space: pre-wrap; margin: 0;">${completeProposal.observations}</div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #E5E7EB;">
            <p style="text-align: center; color: #6B7280; margin: 0;">
              Esta proposta é válida por ${completeProposal?.validity_date ? `até ${formatDate(completeProposal.validity_date)}` : '30 dias'}.
            </p>
          </div>
        </div>
      `;
    };

    // Gerar HTML completo do email
    const generateEmailHTML = (message: string, proposalUrl: string) => {
      const paragraphs = message.split('\n\n').filter(p => p.trim());
      
      const htmlContent = paragraphs.map(paragraph => {
        if (paragraph.includes('[LINK_DA_PROPOSTA]')) {
          const beforeButton = paragraph.split('[LINK_DA_PROPOSTA]')[0];
          const afterButton = paragraph.split('[LINK_DA_PROPOSTA]')[1];
          
          return `
            ${beforeButton ? `<p style="margin: 0 0 32px 0; line-height: 1.9; color: #374151; font-size: 16px;">${beforeButton.replace(/\n/g, '<br><br>')}</p>` : ''}
            <div style="text-align: center; margin: 40px 0;">
              <a href="${proposalUrl}" 
                 style="display: inline-block; 
                        background-color: #2563eb; 
                        color: #ffffff; 
                        padding: 18px 36px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        transition: background-color 0.2s ease;">
                📄 Visualizar Proposta
              </a>
            </div>
            ${afterButton ? `<p style="margin: 32px 0 0 0; line-height: 1.9; color: #374151; font-size: 16px;">${afterButton.replace(/\n/g, '<br><br>')}</p>` : ''}
          `;
        } else {
          return `<p style="margin: 0 0 32px 0; line-height: 1.9; color: #374151; font-size: 16px;">${paragraph.replace(/\n/g, '<br><br>')}</p>`;
        }
      }).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                📋 Proposta Comercial
              </h1>
            </div>
            <div style="padding: 40px;">
              ${htmlContent}
              
              <!-- Proposta Completa -->
              <div style="margin: 60px 0 40px 0; text-align: center;">
                <div style="height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent);"></div>
              </div>
              
              ${generateProposalHTML()}
              
              <!-- Separador elegante -->
              <div style="margin: 60px 0 40px 0; text-align: center;">
                <div style="height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent);"></div>
              </div>
              
              <!-- Footer BoraFecharAI -->
              <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; font-weight: 500;">
                  ✨ Esta proposta foi criada com
                </p>
                <a href="https://www.borafecharai.com" 
                   target="_blank" 
                   style="display: inline-block; 
                          color: #2563eb; 
                          text-decoration: none; 
                          font-size: 20px; 
                          font-weight: 700; 
                          padding: 12px 20px; 
                          border-radius: 8px; 
                          background: rgba(37, 99, 235, 0.1); 
                          transition: all 0.2s ease;
                          border: 2px solid rgba(37, 99, 235, 0.2);">
                  🚀 BoraFecharAI
                </a>
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                  A plataforma que transforma suas propostas em fechamentos
                </p>
              </div>
              
              <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">Esta é uma mensagem automática. Não responda a este email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const emailHTML = generateEmailHTML(emailMessage, finalPublicUrl);

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@borafecharai.com',
        to: [recipientEmail],
        subject: emailSubject,
        html: emailHTML
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Erro ao enviar email via Resend:', errorText)
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar status da proposta para 'enviada'
    await supabase
      .from('proposals')
      .update({ 
        status: 'enviada',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)

    console.log('Email enviado com sucesso para:', recipientEmail)
    console.log('Hash público final:', finalPublicHash)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        publicHash: finalPublicHash,
        publicUrl: finalPublicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no envio de email:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
