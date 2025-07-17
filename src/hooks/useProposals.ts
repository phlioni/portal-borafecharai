import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  title: string;
  client_id?: string;
  service_description?: string;
  detailed_description?: string;
  value?: number;
  delivery_time?: string;
  validity_date?: string;
  observations?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  public_hash?: string;
  template_id?: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  proposal_budget_items?: Array<{
    id: string;
    description: string;
    type: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
  }>;
}

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
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
            description,
            type,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Proposal[];
    },
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) => {
      // Verificar se o usuário pode criar propostas antes de tentar criar
      const { data: canCreate, error: canCreateError } = await supabase.rpc('can_create_proposal', {
        _user_id: proposalData.user_id
      });

      if (canCreateError) {
        console.error('Erro ao verificar permissão:', canCreateError);
        throw new Error('Erro ao verificar permissão para criar proposta');
      }

      if (!canCreate) {
        // Buscar informações sobre o limite para mostrar mensagem específica
        const { data: subscriberData } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier, trial_end_date, trial_proposals_used')
          .eq('user_id', proposalData.user_id)
          .maybeSingle();

        const { data: trialLimits } = await supabase
          .from('trial_limits')
          .select('trial_proposals_limit')
          .eq('user_id', proposalData.user_id)
          .maybeSingle();

        const isInTrial = subscriberData?.trial_end_date && new Date(subscriberData.trial_end_date) > new Date();
        const proposalsUsed = subscriberData?.trial_proposals_used || 0;
        const proposalsLimit = trialLimits?.trial_proposals_limit || 20;

        if (isInTrial) {
          if (proposalsUsed >= proposalsLimit) {
            throw new Error(`Limite de ${proposalsLimit} propostas do trial atingido. Você já criou ${proposalsUsed} propostas. Faça upgrade para continuar criando propostas.`);
          } else {
            throw new Error('Trial expirado. Faça upgrade para continuar criando propostas.');
          }
        } else {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const { data: monthlyCount } = await supabase.rpc('get_monthly_proposal_count', {
            _user_id: proposalData.user_id,
            _month: currentMonth
          });
          
          throw new Error(`Limite de 10 propostas por mês atingido. Você já criou ${monthlyCount || 0} propostas este mês. Faça upgrade para o plano Professional para ter propostas ilimitadas.`);
        }
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
    onError: (error) => {
      console.error('Erro ao criar proposta:', error);
      toast.error(error.message || 'Erro ao criar proposta');
    },
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Proposal> & { id: string }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Proposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar proposta:', error);
      toast.error('Erro ao atualizar proposta');
    },
  });
};

export const useDeleteProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (error) => {
      console.error('Erro ao deletar proposta:', error);
      toast.error('Erro ao deletar proposta');
    },
  });
};

export const useProposal = (id?: string) => {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      if (!id) return null;

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
            description,
            type,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Proposal;
    },
  });
};
