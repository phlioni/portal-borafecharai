
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

  // Função para extrair dados limpos do HTML
  const extractCleanDataFromHTML = (htmlContent: string) => {
    if (!htmlContent) return null;

    // Criar um elemento temporário para processar o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Extrair dados específicos
    const titleElement = tempDiv.querySelector('h1');
    const serviceTitle = titleElement ? titleElement.textContent?.replace('Proposta Comercial para ', '') || '' : '';

    // Extrair cliente
    const clientElements = tempDiv.querySelectorAll('p');
    let client = '';
    let responsible = '';
    let email = '';
    let phone = '';
    let value = 0;
    let deadline = '';
    let paymentMethod = '';

    clientElements.forEach(p => {
      const text = p.textContent || '';
      if (text.includes('Cliente:')) {
        client = text.replace(/.*Cliente:\s*/, '').trim();
      }
      if (text.includes('Responsável:')) {
        responsible = text.replace(/.*Responsável:\s*/, '').trim();
      }
      if (text.includes('Contato:')) {
        const contactText = text.replace(/.*Contato:\s*/, '');
        const parts = contactText.split('/');
        email = parts[0]?.trim() || '';
        phone = parts[1]?.trim() || '';
      }
      if (text.includes('Valor total:')) {
        const valueText = text.replace(/.*Valor total:\s*R\$\s*/, '').trim();
        const numericValue = valueText.replace(/[^\d,]/g, '');
        if (numericValue) {
          value = parseFloat(numericValue.replace(',', '.'));
        }
      }
      if (text.includes('Forma de pagamento:')) {
        paymentMethod = text.replace(/.*Forma de pagamento:\s*/, '').trim();
      }
    });

    // Extrair prazo
    const deadlineElements = tempDiv.querySelectorAll('strong');
    deadlineElements.forEach(strong => {
      const text = strong.textContent || '';
      if (text.includes('dias')) {
        deadline = text;
      }
    });

    // Extrair descrição (texto das seções)
    let description = '';
    const introSection = tempDiv.querySelector('h2:nth-of-type(2)');
    if (introSection && introSection.nextElementSibling) {
      const introP = introSection.nextElementSibling.nextElementSibling;
      if (introP && introP.textContent) {
        description = introP.textContent.replace(/Prezada?\(o\)\s+\w+,\s*/, '').trim();
      }
    }

    // Se não encontrou descrição na intro, pegar do escopo
    if (!description) {
      const scopeSection = Array.from(tempDiv.querySelectorAll('h2')).find(h2 => 
        h2.textContent?.includes('Escopo')
      );
      if (scopeSection && scopeSection.nextElementSibling) {
        const ul = scopeSection.nextElementSibling;
        if (ul.tagName === 'UL') {
          const items = Array.from(ul.querySelectorAll('li')).map(li => li.textContent).join(', ');
          description = `Escopo dos serviços: ${items}`;
        }
      }
    }

    return {
      serviceTitle: serviceTitle || proposal.title || 'Proposta Comercial',
      client: client || proposal.companies?.name || 'Cliente',
      responsible,
      email,
      phone,
      value: value || proposal.value,
      deadline: deadline || proposal.delivery_time,
      paymentMethod,
      description: description || proposal.service_description || 'Descrição do serviço'
    };
  };

  const templateId = proposal.template_id || 'moderno';

  // Processar dados do HTML se disponível
  let processedData = null;
  if (proposal.detailed_description && proposal.detailed_description.includes('<h1>')) {
    processedData = extractCleanDataFromHTML(proposal.detailed_description);
  }

  // Preparar dados para o componente de preview
  const previewData = {
    title: processedData?.serviceTitle || proposal.title || 'Proposta Comercial',
    client: processedData?.client || proposal.companies?.name || 'Cliente',
    value: processedData?.value || proposal.value,
    deliveryTime: processedData?.deadline || proposal.delivery_time,
    description: processedData?.description || proposal.service_description,
    template: templateId,
    // Dados adicionais extraídos
    responsible: processedData?.responsible,
    email: processedData?.email,
    phone: processedData?.phone,
    paymentMethod: processedData?.paymentMethod
  };

  // Renderizar template personalizado se disponível e usuário tem acesso
  if ((canAccessPremiumTemplates || isAdmin) && customTemplates.length > 0) {
    const customTemplate = customTemplates.find(t => t.template_id === templateId);
    if (customTemplate) {
      // Para templates personalizados, usar o preview component para manter consistência
      return (
        <ProposalTemplatePreview 
          data={previewData}
          className="max-w-4xl mx-auto"
        />
      );
    }
  }
  
  // Usar sempre o componente de preview para manter consistência visual
  return (
    <ProposalTemplatePreview 
      data={previewData}
      className="max-w-4xl mx-auto"
    />
  );
};

export default ProposalTemplateRenderer;
