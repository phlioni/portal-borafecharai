
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProposalTemplateRenderer from '@/components/ProposalTemplateRenderer';
import { Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';

const PropostaPublicaPage = () => {
  const { hash } = useParams();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: proposal, isLoading, refetch } = useQuery({
    queryKey: ['public-proposal', hash],
    queryFn: async () => {
      if (!hash) throw new Error('Hash não fornecido');
      
      console.log('Buscando proposta com hash:', hash);
      
      // Primeiro, tentar buscar pelo public_hash diretamente
      const { data: proposalByHash, error: hashError } = await supabase
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
        .eq('public_hash', hash)
        .single();

      if (!hashError && proposalByHash) {
        console.log('Proposta encontrada por hash:', proposalByHash);
        return proposalByHash;
      }

      // Se não encontrar pelo hash, tentar decodificar base64 (compatibilidade)
      try {
        const proposalId = atob(hash);
        console.log('Tentando buscar por ID decodificado:', proposalId);
        
        const { data: proposalById, error: idError } = await supabase
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

        if (idError) throw idError;
        
        console.log('Proposta encontrada por ID:', proposalById);
        return proposalById;
      } catch (error) {
        console.error('Erro ao buscar proposta:', error);
        throw new Error('Proposta não encontrada');
      }
    },
    enabled: !!hash,
  });

  const handleAcceptProposal = async () => {
    if (!proposal) return;

    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'aceita' })
        .eq('id', proposal.id);

      if (error) throw error;

      toast.success('Proposta aceita com sucesso!');
      
      // Incrementar visualizações
      await supabase
        .from('proposals')
        .update({ 
          views: (proposal.views || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', proposal.id);

      // Atualizar dados na tela
      refetch();
    } catch (error) {
      console.error('Erro ao aceitar proposta:', error);
      toast.error('Erro ao aceitar proposta');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!proposal) return;

    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'perdida' })
        .eq('id', proposal.id);

      if (error) throw error;

      toast.success('Proposta rejeitada');
      
      // Incrementar visualizações
      await supabase
        .from('proposals')
        .update({ 
          views: (proposal.views || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', proposal.id);

      // Atualizar dados na tela
      refetch();
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error);
      toast.error('Erro ao rejeitar proposta');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDownloadPDF = () => {
    toast.info('Use Ctrl+P para salvar como PDF ou imprimir');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Verificar se a proposta está dentro da validade
  const isValid = proposal?.validity_date ? 
    new Date(proposal.validity_date) >= new Date() : true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Proposta não encontrada
            </h1>
            <p className="text-gray-600">
              O link pode estar expirado ou inválido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <X className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Proposta Expirada
            </h1>
            <p className="text-gray-600">
              Esta proposta expirou em {new Date(proposal.validity_date!).toLocaleDateString('pt-BR')}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ações Fixas */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {proposal.title}
              </h2>
              <p className="text-sm text-gray-600 truncate">
                De: {proposal.companies?.name}
              </p>
              {proposal.status !== 'enviada' && (
                <div className="mt-2">
                  {proposal.status === 'aceita' && (
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Proposta Aceita</span>
                    </div>
                  )}
                  {proposal.status === 'perdida' && (
                    <div className="flex items-center gap-2 text-red-700">
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">Proposta Rejeitada</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Botão de Download sempre visível */}
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>

              {/* Botões de aceitar/rejeitar apenas se a proposta estiver enviada */}
              {proposal.status === 'enviada' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleRejectProposal}
                    disabled={isRejecting}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
                  </Button>
                  <Button
                    onClick={handleAcceptProposal}
                    disabled={isAccepting}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isAccepting ? 'Aceitando...' : 'Aceitar Proposta'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Proposta */}
      <div className="pt-24 sm:pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm">
            <ProposalTemplateRenderer 
              proposal={proposal} 
              companyLogo="" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropostaPublicaPage;
