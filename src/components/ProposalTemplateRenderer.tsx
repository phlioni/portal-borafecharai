
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import ProposalTemplatePreview from '@/components/ProposalTemplatePreview';

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

  // Função para extrair dados do HTML do modelo oficial
  const extractDataFromOfficialModel = (htmlContent: string) => {
    if (!htmlContent || !htmlContent.includes('<h1>Proposta Comercial para')) {
      return null;
    }

    // Extrair título do serviço
    const titleMatch = htmlContent.match(/<h1>Proposta Comercial para ([^<]+)<\/h1>/);
    const serviceTitle = titleMatch ? titleMatch[1].trim() : '';

    // Extrair valor
    const valueMatch = htmlContent.match(/<strong>Valor total:<\/strong>\s*R\$\s*([^<]+)/);
    const valueText = valueMatch ? valueMatch[1].trim() : '';
    
    // Converter valor para número
    let numericValue = 0;
    if (valueText) {
      const cleanValue = valueText.replace(/[^\d,]/g, '');
      if (cleanValue && cleanValue !== '0,00') {
        numericValue = parseFloat(cleanValue.replace(',', '.'));
      }
    }

    // Extrair prazo
    const deadlineMatch = htmlContent.match(/<strong>([^<]*prazo[^<]*)<\/strong>[^<]*<strong>([^<]+)<\/strong>/i);
    const deadline = deadlineMatch ? deadlineMatch[2].trim() : '';

    // Extrair cliente
    const clientMatch = htmlContent.match(/<strong>Cliente:<\/strong>\s*([^<]+)/);
    const client = clientMatch ? clientMatch[1].trim() : '';

    // Extrair responsável
    const responsibleMatch = htmlContent.match(/<strong>Responsável:<\/strong>\s*([^<]+)/);
    const responsible = responsibleMatch ? responsibleMatch[1].trim() : '';

    // Extrair descrição detalhada (texto entre tags p)
    const descriptionMatches = htmlContent.match(/<p>([^<]+)<\/p>/g);
    let description = '';
    if (descriptionMatches) {
      // Pegar as primeiras descrições relevantes, ignorando dados estruturados
      const relevantDescriptions = descriptionMatches
        .map(match => match.replace(/<\/?p>/g, ''))
        .filter(text => 
          !text.includes('Número da proposta:') && 
          !text.includes('Data:') &&
          !text.includes('Cliente:') &&
          !text.includes('Responsável:') &&
          !text.includes('Contato:') &&
          !text.includes('Valor total:') &&
          !text.includes('Forma de pagamento:') &&
          text.length > 20
        );
      
      if (relevantDescriptions.length > 0) {
        description = relevantDescriptions[0];
      }
    }

    return {
      serviceTitle,
      numericValue,
      deadline,
      client,
      responsible,
      description,
      fullHtmlContent: htmlContent
    };
  };

  const templateId = proposal.template_id || 'moderno';

  // Processar dados do modelo oficial se disponível
  const officialModelData = proposal.detailed_description ? 
    extractDataFromOfficialModel(proposal.detailed_description) : null;

  // Preparar dados para o componente de preview (mesmo formato usado no chat)
  const previewData = {
    title: officialModelData?.serviceTitle || proposal.title || proposal.service_description || 'Proposta Comercial',
    client: officialModelData?.client || proposal.companies?.name || 'Cliente',
    value: officialModelData?.numericValue || proposal.value,
    deliveryTime: officialModelData?.deadline || proposal.delivery_time,
    description: officialModelData?.description || proposal.detailed_description || proposal.service_description,
    template: templateId
  };

  // Renderizar template personalizado se disponível e usuário tem acesso
  if ((canAccessPremiumTemplates || isAdmin) && customTemplates.length > 0) {
    const customTemplate = customTemplates.find(t => t.template_id === templateId);
    if (customTemplate) {
      const processedContent = customTemplate.html_content.replace(/\{\{companyLogo\}\}/g, companyLogo || '');
      return (
        <div 
          dangerouslySetInnerHTML={{ 
            __html: processedContent
          }} 
        />
      );
    }
  }
  
  // Usar o mesmo componente de preview usado no chat para manter consistência visual
  return (
    <ProposalTemplatePreview 
      data={previewData}
      className="max-w-4xl mx-auto"
    />
  );
};

export default ProposalTemplateRenderer;
