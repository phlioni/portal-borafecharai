
import React, { useState, useEffect } from 'react';
import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProposalTemplateRendererProps {
  proposal: any;
  companyLogo?: string;
}

const ProposalTemplateRenderer = ({ proposal, companyLogo: providedLogo }: ProposalTemplateRendererProps) => {
  const { user } = useAuth();
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
