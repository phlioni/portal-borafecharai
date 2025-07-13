import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';

interface ProposalTemplateRendererProps {
  proposal: any;
  companyLogo: string;
}

const ProposalTemplateRenderer = ({ proposal, companyLogo }: ProposalTemplateRendererProps) => {
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