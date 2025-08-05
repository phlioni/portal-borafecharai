import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ProposalTemplateRenderer from '@/components/ProposalTemplateRenderer';
import { ScheduleModal } from '@/components/ScheduleModal';

const PropostaPublicaPage = () => {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['public-proposal', hash],
    queryFn: async () => {
      if (!hash) throw new Error('Hash não fornecido');
      
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
        .eq('public_hash', hash)
        .single();
      
      if (error) throw error;
      
      // Increment views counter
      await supabase
        .from('proposals')
        .update({ 
          views: (data.views || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      return data;
    },
    enabled: !!hash,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: 'aceita' | 'rejeitada') => {
      if (!proposal) throw new Error('Proposta não encontrada');
      
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposal.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-proposal', hash] });
    },
  });

  const handleStatusUpdate = (status: 'aceita' | 'rejeitada') => {
    updateStatusMutation.mutate(status, {
      onSuccess: () => {
        toast.success(
          status === 'aceita' 
            ? 'Proposta aceita com sucesso! Em breve entraremos em contato.' 
            : 'Resposta enviada. Obrigado pelo feedback.'
        );
      },
      onError: () => {
        toast.error('Erro ao atualizar status da proposta');
      },
    });
  };

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Proposta não encontrada
          </h1>
          <p className="text-gray-600">
            A proposta que você está procurando não existe ou foi removida.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceita': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      case 'enviada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aceita': return 'Aceita';
      case 'rejeitada': return 'Rejeitada';
      case 'enviada': return 'Aguardando Resposta';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Proposta Comercial
          </h1>
          <div className="flex items-center justify-center gap-4">
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusText(proposal.status)}
            </Badge>
            {proposal.proposal_number && (
              <span className="text-sm text-gray-600">
                #{proposal.proposal_number}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {proposal.status === 'enviada' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-center">
              O que você gostaria de fazer?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => handleStatusUpdate('aceita')}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-5 w-5" />
                Aceitar Proposta
              </Button>
              
              <Button
                onClick={handleScheduleClick}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Agendar Atendimento
              </Button>
              
              <Button
                onClick={() => handleStatusUpdate('rejeitada')}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-2"
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-5 w-5" />
                Recusar Proposta
              </Button>
            </div>
          </div>
        )}

        {/* Proposal Content */}
        <div className="bg-white rounded-lg shadow-sm p-1">
          <ProposalTemplateRenderer 
            proposal={proposal} 
            companyLogo="" 
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Esta proposta foi criada com ❤️ usando BoraFecharAI</p>
        </div>
      </div>

      {/* Schedule Modal */}
      {proposal.clients && (
        <ScheduleModal
          proposalId={proposal.id}
          clientId={proposal.clients.id}
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
        />
      )}
    </div>
  );
};

export default PropostaPublicaPage;
