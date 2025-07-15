
import React, { useState, useEffect } from 'react';
import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { useUserPermissions } from '@/hooks/useUserPermissions';

const MODELO_OFICIAL_HTML = `<h1>Proposta Comercial para {servico}</h1>

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

interface ProposalTemplateRendererProps {
  proposal: any;
  companyLogo?: string;
}

const ProposalTemplateRenderer = ({ proposal, companyLogo: providedLogo }: ProposalTemplateRendererProps) => {
  const { user } = useAuth();
  const { templates: customTemplates } = useCustomTemplates();
  const { canAccessPremiumTemplates, isAdmin } = useUserPermissions();
  const [companyLogo, setCompanyLogo] = useState<string>(providedLogo || '');

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (providedLogo || !user) return;

      try {
        const { data: companyData } = await supabase
          .from('companies')
          .select('logo_url')
          .eq('user_id', user.id)
          .single();

        if (companyData?.logo_url) {
          setCompanyLogo(companyData.logo_url);
        }
      } catch (error) {
        console.error('Erro ao carregar logo da empresa:', error);
      }
    };

    fetchCompanyLogo();
  }, [user, providedLogo]);

  // Função para processar conteúdo usando o modelo oficial
  const processProposalContent = (content: string) => {
    if (!content || content.includes('Proposta Comercial para')) {
      return content;
    }

    // Se o conteúdo não segue o modelo oficial, usar o modelo como base
    let processedContent = MODELO_OFICIAL_HTML;
    
    // Substituir placeholders básicos
    const today = new Date();
    const replacements = {
      '{servico}': proposal.title || proposal.service_description || 'Serviço',
      '{numero_proposta}': `PROP-${proposal.id?.slice(-8) || Date.now()}`,
      '{data}': today.toLocaleDateString('pt-BR'),
      '{cliente}': proposal.companies?.name || 'Cliente',
      '{responsavel}': proposal.companies?.name || 'Responsável',
      '{email}': proposal.companies?.email || 'email@exemplo.com',
      '{telefone}': proposal.companies?.phone || '(11) 99999-9999',
      '{prazo}': proposal.delivery_time || '30 dias',
      '{valor}': proposal.value ? proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00',
      '{pagamento}': 'A definir',
      '{vencimento}': 'A definir',
      '{dias_suporte}': '30',
      '{validade}': '30'
    };

    // Aplicar substituições
    for (const [placeholder, value] of Object.entries(replacements)) {
      processedContent = processedContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return processedContent;
  };

  const templateId = proposal.template_id || 'moderno';

  // Renderizar template personalizado se disponível e usuário tem acesso
  if ((canAccessPremiumTemplates || isAdmin) && customTemplates.length > 0) {
    const customTemplate = customTemplates.find(t => t.template_id === templateId);
    if (customTemplate) {
      const processedContent = processProposalContent(customTemplate.html_content);
      return (
        <div 
          dangerouslySetInnerHTML={{ 
            __html: processedContent.replace(/\{\{companyLogo\}\}/g, companyLogo || '')
          }} 
        />
      );
    }
  }

  // Processar conteúdo para templates padrão
  const proposalWithProcessedContent = {
    ...proposal,
    detailed_description: proposal.detailed_description ? 
      processProposalContent(proposal.detailed_description) : 
      processProposalContent('')
  };
  
  // Renderizar templates padrão
  switch (templateId) {
    case 'executivo':
      return <ExecutivoTemplate proposal={proposalWithProcessedContent} companyLogo={companyLogo} />;
    case 'criativo':
      return <CriativoTemplate proposal={proposalWithProcessedContent} companyLogo={companyLogo} />;
    default:
      return <ModernoTemplate proposal={proposalWithProcessedContent} companyLogo={companyLogo} />;
  }
};

export default ProposalTemplateRenderer;
