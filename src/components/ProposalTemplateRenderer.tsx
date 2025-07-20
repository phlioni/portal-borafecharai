
import React from 'react';
import StandardProposalTemplate from '@/components/StandardProposalTemplate';

interface ProposalTemplateRendererProps {
  proposal: any;
  companyLogo?: string;
}

const ProposalTemplateRenderer = ({ proposal, companyLogo }: ProposalTemplateRendererProps) => {
  console.log('ProposalTemplateRenderer - Dados da proposta:', proposal);

  // Usar sempre o novo template padrão
  return (
    <StandardProposalTemplate
      proposal={proposal}
      companyLogo={companyLogo}
      className="max-w-4xl mx-auto"
    />
  );
};

export default ProposalTemplateRenderer;
