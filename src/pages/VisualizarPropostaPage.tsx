
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SendProposalModal from '@/components/SendProposalModal';
import ProposalPreviewModal from '@/components/ProposalPreviewModal';
import ProposalHeader from '@/components/ProposalHeader';
import ProposalTemplateRenderer from '@/components/ProposalTemplateRenderer';
import { useProposalSending } from '@/hooks/useProposalSending';
import { useCreateBudgetItem } from '@/hooks/useBudgetItems';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const VisualizarPropostaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [itemsProcessed, setItemsProcessed] = useState(false);
  const { sendProposal, isSending } = useProposalSending();
  const createBudgetItem = useCreateBudgetItem();

  const { data: proposal, isLoading, refetch } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da proposta não fornecido');
      
      const { data, error } = await supabase
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
            type,
            description,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Verificar se há itens pendentes do sessionStorage apenas uma vez
  useEffect(() => {
    const processPendingItems = async () => {
      if (itemsProcessed) return; // Evita processamento duplo
      
      const pendingItems = sessionStorage.getItem('pendingBudgetItems');
      if (pendingItems && id) {
        try {
          const items = JSON.parse(pendingItems);
          console.log('Processando itens pendentes:', items);
          
          // Marcar como processado antes de salvar para evitar loops
          setItemsProcessed(true);
          sessionStorage.removeItem('pendingBudgetItems');
          
          // Salvar cada item no banco de dados
          await Promise.all(
            items.map((item: any) => 
              createBudgetItem.mutateAsync({
                proposal_id: id,
                type: item.type,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price
              })
            )
          );
          
          toast.success('Itens do orçamento salvos com sucesso!');
          
          // Recarregar os dados da proposta para incluir os novos itens
          refetch();
        } catch (error) {
          console.error('Erro ao salvar itens do orçamento:', error);
          toast.error('Erro ao salvar itens do orçamento');
          setItemsProcessed(false); // Permitir nova tentativa em caso de erro
        }
      }
    };

    if (!isLoading && proposal && !itemsProcessed) {
      processPendingItems();
    }
  }, [id, createBudgetItem, isLoading, proposal, refetch, itemsProcessed]);

  const handleSendProposal = async (emailData: any) => {
    if (!proposal) return;

    const success = await sendProposal(proposal, emailData);
    if (success) {
      setShowSendModal(false);
    }
  };

  const handleViewPublic = () => {
    if (!proposal) return;
    
    // Usar o hash público se existir, senão usar base64 do ID
    const hash = proposal.public_hash || btoa(proposal.id);
    const publicUrl = `/proposta/${hash}`;
    console.log('Abrindo URL pública:', publicUrl);
    window.open(publicUrl, '_blank');
  };

  const handleDownloadPDF = () => {
    if (!proposal) return;
    
    // Usar o hash público se existir, senão usar base64 do ID
    const hash = proposal.public_hash || btoa(proposal.id);
    const publicUrl = `/proposta/${hash}`;
    console.log('Abrindo para PDF:', publicUrl);
    window.open(publicUrl, '_blank');
    toast.info('A proposta foi aberta em uma nova aba. Use Ctrl+P para imprimir/salvar como PDF');
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando proposta..." />;
  }

  if (!proposal) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposta não encontrada</h1>
        <Button asChild>
          <Link to="/propostas">Voltar para Propostas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <ProposalHeader
          proposal={proposal}
          onBack={() => navigate('/propostas')}
          onViewPublic={handleViewPublic}
          onDownloadPDF={handleDownloadPDF}
          onEdit={() => navigate(`/propostas/editar/${proposal.id}`)}
          onSend={() => setShowPreviewModal(true)}
        />

        {/* Proposal Preview */}
        <div className="bg-white rounded-lg shadow-sm p-1">
          <div className="transform scale-75 origin-top">
            <ProposalTemplateRenderer proposal={proposal} companyLogo={companyLogo} />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ProposalPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onContinue={() => {
          setShowPreviewModal(false);
          setShowSendModal(true);
        }}
        proposal={proposal}
        companyLogo={companyLogo}
      />

      {/* Send Modal */}
      <SendProposalModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendProposal}
        proposalTitle={proposal.title}
        clientName={proposal.clients?.name}
        clientEmail={proposal.clients?.email}
        isLoading={isSending}
      />
    </div>
  );
};

export default VisualizarPropostaPage;
