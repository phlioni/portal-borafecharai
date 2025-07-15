
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

  const templateId = proposal.template_id || 'moderno';

  // Preparar dados consistentes para o componente de preview
  const previewData = {
    title: proposal.title || 'Proposta Comercial',
    client: proposal.companies?.name || 'Cliente',
    value: proposal.value, // Usar valor original sem conversão
    deliveryTime: proposal.delivery_time,
    description: proposal.service_description,
    detailedDescription: proposal.detailed_description,
    observations: proposal.observations,
    template: templateId,
    companyLogo: companyLogo
  };

  console.log('ProposalTemplateRenderer - Dados da proposta:', {
    originalValue: proposal.value,
    processedValue: previewData.value,
    title: previewData.title,
    client: previewData.client
  });

  // Renderizar template personalizado se disponível e usuário tem acesso
  if ((canAccessPremiumTemplates || isAdmin) && customTemplates.length > 0) {
    const customTemplate = customTemplates.find(t => t.template_id === templateId);
    if (customTemplate) {
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
