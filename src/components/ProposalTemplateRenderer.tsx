
import React, { useState, useEffect } from 'react';
import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { useUserPermissions } from '@/hooks/useUserPermissions';

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

  // Renderizar template personalizado se disponível e usuário tem acesso
  if ((canAccessPremiumTemplates || isAdmin) && customTemplates.length > 0) {
    const customTemplate = customTemplates.find(t => t.template_id === templateId);
    if (customTemplate) {
      return (
        <div 
          dangerouslySetInnerHTML={{ 
            __html: customTemplate.html_content
              .replace(/\{\{proposal\.title\}\}/g, proposal.title || '')
              .replace(/\{\{proposal\.companies\.name\}\}/g, proposal.companies?.name || '')
              .replace(/\{\{proposal\.service_description\}\}/g, proposal.service_description || '')
              .replace(/\{\{proposal\.detailed_description\}\}/g, proposal.detailed_description || '')
              .replace(/\{\{proposal\.value\}\}/g, proposal.value ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '')
              .replace(/\{\{proposal\.delivery_time\}\}/g, proposal.delivery_time || '')
              .replace(/\{\{proposal\.observations\}\}/g, proposal.observations || '')
              .replace(/\{\{companyLogo\}\}/g, companyLogo || '')
          }} 
        />
      );
    }
  }
  
  // Renderizar templates padrão
  switch (templateId) {
    case 'executivo':
      return <ExecutivoTemplate proposal={proposal} companyLogo={companyLogo} />;
    case 'criativo':
      return <CriativoTemplate proposal={proposal} companyLogo={companyLogo} />;
    default:
      return <ModernoTemplate proposal={proposal} companyLogo={companyLogo} />;
  }
};

export default ProposalTemplateRenderer;
