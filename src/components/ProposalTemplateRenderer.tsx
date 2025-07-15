
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StandardProposalTemplate from '@/components/StandardProposalTemplate';

interface ProposalTemplateRendererProps {
  proposal: any;
  companyLogo?: string;
}

const ProposalTemplateRenderer = ({ proposal }: ProposalTemplateRendererProps) => {
  console.log('ProposalTemplateRenderer - Dados da proposta:', proposal);

  // Usar sempre o novo template padrão
  return (
    <StandardProposalTemplate 
      proposal={proposal}
      className="max-w-4xl mx-auto"
    />
  );
};

export default ProposalTemplateRenderer;
