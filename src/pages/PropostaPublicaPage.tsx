import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StandardProposalTemplate from '@/components/StandardProposalTemplate';
import { Check, X, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleModal } from '@/components/ScheduleModal';
import { ImprovedScheduleModal } from '@/components/ImprovedScheduleModal';

const PropostaPublicaPage = () => {
  const { hash } = useParams();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: proposal, isLoading, refetch } = useQuery({
    queryKey: ['public-proposal', hash],
    queryFn: async () => {
      if (!hash) throw new Error('Hash não fornecido');

      console.log('Buscando proposta com hash:', hash);

      // Buscar proposta com todos os dados necessários (igual ao preview)
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          ),
          proposal_budget_items (
            id,
            description,
            quantity,
            unit_price,
            total_price,
            type
          )
        `)
        .eq('public_hash', hash)
        .single();

      if (proposalError) {
        console.error('Erro ao buscar proposta por hash:', proposalError);
        throw new Error('Proposta não encontrada');
      }

      console.log('Proposta encontrada por hash:', proposalData);

      // Buscar informações da empresa do usuário na tabela user_companies
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', proposalData.user_id)
        .maybeSingle();

      if (userCompanyError) {
        console.error('Erro ao buscar empresa do usuário:', userCompanyError);
      }

      // Buscar dados do perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', proposalData.user_id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Incrementar visualizações automaticamente
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          views: (proposalData.views || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', proposalData.id);

      if (updateError) {
        console.error('Erro ao atualizar visualizações:', updateError);
      }

      // Retornar dados completos incluindo empresa e perfil
      return {
        ...proposalData,
        user_companies: userCompanyData,
        user_profile: userProfile
      };
    },
    enabled: !!hash,
    retry: 2,
    retryDelay: 1000,
  });

  // Verificar se já existe agendamento para esta proposta
  const { data: existingServiceOrder } = useQuery({
    queryKey: ['service-order-by-proposal', proposal?.id],
    queryFn: async () => {
      if (!proposal?.id) return null;
      
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('proposal_id', proposal.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar agendamento:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!proposal?.id && proposal?.status === 'aceita'
  });

  const handleAcceptProposal = async () => {
    if (!proposal) return;

    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'aceita',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id);

      if (error) throw error;

      toast.success('Proposta aceita com sucesso!');
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
        .update({
          status: 'perdida',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id);

      if (error) throw error;

      toast.success('Proposta rejeitada');
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

  // Verificar se a proposta está dentro da validade (apenas se validity_date existir)
  const isValid = !proposal?.validity_date ||
    new Date(proposal.validity_date) >= new Date();

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
            <p className="text-xs text-gray-500 mt-4">
              Hash buscado: {hash}
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
      {/* Ações Fixas - Ajustado para mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                {proposal.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Para: {proposal.clients?.name}
              </p>
              {proposal.status !== 'enviada' && (
                <div className="mt-1 sm:mt-2">
                  {proposal.status === 'aceita' && (
                    <div className="flex items-center gap-1 sm:gap-2 text-green-700">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">Proposta Aceita</span>
                    </div>
                  )}
                  {proposal.status === 'perdida' && (
                    <div className="flex items-center gap-1 sm:gap-2 text-red-700">
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">Proposta Rejeitada</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões de Ação - Melhorados para mobile */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
              {/* Botão de Download sempre visível */}
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 h-9 text-xs sm:text-sm px-3 sm:px-4"
                size="sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Baixar PDF</span>
                <span className="xs:hidden">PDF</span>
              </Button>

              {/* Botão de Agendamento - condicional baseado no status */}
              {proposal.status === 'aceita' && (
                <>
                  {existingServiceOrder ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                      {existingServiceOrder.status === 'finalizado' ? (
                        <Button
                          variant="outline"
                          disabled={true}
                          className="bg-gray-50 text-gray-500 border-gray-200 h-9 text-xs sm:text-sm px-3 sm:px-4 cursor-not-allowed"
                          size="sm"
                        >
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Serviço Concluído</span>
                          <span className="xs:hidden">Concluído</span>
                        </Button>
                      ) : (
                        <>
                          <div className="text-xs text-center text-gray-600 p-2 bg-gray-50 rounded border">
                            <p className="font-medium">Agendado para:</p>
                            <p>{new Date(existingServiceOrder.scheduled_date).toLocaleDateString('pt-BR')}</p>
                            <p>às {existingServiceOrder.scheduled_time}</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setShowScheduleModal(true)}
                            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 h-9 text-xs sm:text-sm px-3 sm:px-4"
                            size="sm"
                          >
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">Editar Agendamento</span>
                            <span className="xs:hidden">Editar</span>
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowScheduleModal(true)}
                      className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 h-9 text-xs sm:text-sm px-3 sm:px-4"
                      size="sm"
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Agendar Atendimento</span>
                      <span className="xs:hidden">Agendar</span>
                    </Button>
                  )}
                </>
              )}

              {/* Botões de aceitar/rejeitar apenas se a proposta estiver enviada */}
              {proposal.status === 'enviada' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleRejectProposal}
                    disabled={isRejecting}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 h-9 text-xs sm:text-sm px-3 sm:px-4"
                    size="sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">{isRejecting ? 'Rejeitando...' : 'Rejeitar'}</span>
                    <span className="xs:hidden">Recusar</span>
                  </Button>
                  <Button
                    onClick={handleAcceptProposal}
                    disabled={isAccepting}
                    className="bg-green-600 hover:bg-green-700 h-9 text-xs sm:text-sm px-3 sm:px-4"
                    size="sm"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">{isAccepting ? 'Aceitando...' : 'Aceitar Proposta'}</span>
                    <span className="xs:hidden">Aceitar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Proposta - Usando StandardProposalTemplate */}
      <div className="pt-32 sm:pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm mt-10">
            <StandardProposalTemplate
              proposal={proposal}
              companyLogo={proposal.user_companies?.logo_url || ""}
            />
          </div>
        </div>
      </div>

      {/* Modal de Agendamento Melhorado */}
      {proposal.clients && (
        <ImprovedScheduleModal
          proposalId={proposal.id}
          clientId={proposal.clients.id}
          userId={proposal.user_id}
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
          existingOrder={existingServiceOrder}
        />
      )}
    </div>
  );
};

export default PropostaPublicaPage;
