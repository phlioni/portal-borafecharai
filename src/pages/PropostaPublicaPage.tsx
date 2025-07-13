
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';
import { toast } from 'sonner';

const PropostaPublicaPage = () => {
  const { token } = useParams();
  const [proposal, setProposal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');

  useEffect(() => {
    const loadProposal = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Decodificar o token para obter o ID da proposta
        const proposalId = atob(token);
        
        const { data, error } = await supabase
          .from('proposals')
          .select(`
            *,
            companies (
              id,
              name,
              email,
              phone
            )
          `)
          .eq('id', proposalId)
          .single();

        if (error) {
          console.error('Erro ao carregar proposta:', error);
          toast.error('Proposta não encontrada');
          setIsLoading(false);
          return;
        }

        // Verificar se a proposta ainda é válida
        if (data.validity_date) {
          const validityDate = new Date(data.validity_date);
          const currentDate = new Date();
          if (currentDate > validityDate) {
            toast.error('Esta proposta expirou');
            setIsValid(false);
            setIsLoading(false);
            return;
          }
        }

        setProposal(data);
        setIsValid(true);

        // Carregar logo da empresa (se disponível)
        const savedLogo = localStorage.getItem('company_logo');
        if (savedLogo) {
          setCompanyLogo(savedLogo);
        }

        // Atualizar visualizações
        await supabase
          .from('proposals')
          .update({ 
            views: (data.views || 0) + 1,
            last_viewed_at: new Date().toISOString()
          })
          .eq('id', proposalId);

      } catch (error) {
        console.error('Erro ao processar token:', error);
        toast.error('Link inválido');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposal();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (!isValid || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposta não encontrada</h1>
          <p className="text-gray-600">
            Esta proposta pode ter expirado ou o link pode estar incorreto.
          </p>
        </div>
      </div>
    );
  }

  // Renderizar template baseado no tipo
  const renderTemplate = () => {
    const templateId = proposal.template_id || 'moderno';
    
    switch (templateId) {
      case 'executivo':
        return <ExecutivoTemplate proposal={proposal} isPublicView={true} companyLogo={companyLogo} />;
      case 'criativo':
        return <CriativoTemplate proposal={proposal} isPublicView={true} companyLogo={companyLogo} />;
      default:
        return <ModernoTemplate proposal={proposal} isPublicView={true} companyLogo={companyLogo} />;
    }
  };

  return (
    <div className="print:p-0">
      {renderTemplate()}
    </div>
  );
};

export default PropostaPublicaPage;
