
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
  views?: number;
  proposal_number?: string;
  payment_terms?: string;
  total_amount?: number;
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
  companies?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    logo_url?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    cnpj?: string;
    website?: string;
    business_segment?: string;
    business_type_detail?: string;
  };
  user_profile?: {
    id: string;
    name?: string;
    phone?: string;
    avatar_url?: string;
  };
  user_companies?: any;
}

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      // Primeiro verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

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
        .eq('user_id', user.id) // Garantir que só busque propostas do usuário atual
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Proposal[];
    },
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: Partial<Proposal>) => {
      // Verificar autenticação antes de criar proposta
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Garantir que o user_id seja sempre do usuário atual e adicionar campos necessários
      const secureProposalData = {
        ...proposalData,
        user_id: user.id,
        template_id: proposalData.template_id || null,
        payment_terms: proposalData.payment_terms || '',
        total_amount: proposalData.total_amount || 0,
      };

      // Verificar se o usuário pode criar propostas antes de tentar criar
      const { data: canCreate, error: canCreateError } = await supabase.rpc('can_create_proposal', {
        _user_id: user.id
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
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: trialLimits } = await supabase
          .from('trial_limits')
          .select('trial_proposals_limit')
          .eq('user_id', user.id)
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
            _user_id: user.id,
            _month: currentMonth
          });
          
          throw new Error(`Limite de 10 propostas por mês atingido. Você já criou ${monthlyCount || 0} propostas este mês. Faça upgrade para o plano Professional para ter propostas ilimitadas.`);
        }
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert(secureProposalData)
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proposal> }) => {
      // Verificar autenticação antes de atualizar
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se a proposta pertence ao usuário antes de atualizar
      const { data: existingProposal, error: checkError } = await supabase
        .from('proposals')
        .select('user_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (checkError || !existingProposal) {
        throw new Error('Proposta não encontrada ou acesso negado');
      }

      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Garantir que só atualize propostas do usuário atual
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
      // Verificar autenticação antes de deletar
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se a proposta pertence ao usuário e se pode ser deletada
      const { data: existingProposal, error: checkError } = await supabase
        .from('proposals')
        .select('user_id, status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (checkError || !existingProposal) {
        throw new Error('Proposta não encontrada ou acesso negado');
      }

      // Verificar se a proposta pode ser deletada (apenas rascunhos)
      if (existingProposal.status && existingProposal.status !== 'rascunho') {
        throw new Error('Propostas enviadas não podem ser excluídas');
      }

      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só delete propostas do usuário atual

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar proposta:', error);
      toast.error(error.message || 'Erro ao deletar proposta');
    },
  });
};

export const useProposal = (id?: string) => {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      if (!id) return null;

      // Verificar autenticação antes de buscar proposta específica
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

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
        .eq('user_id', user.id) // Garantir que só busque propostas do usuário atual
        .single();

      if (error) throw error;

      // Buscar informações da empresa do usuário na tabela user_companies
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userCompanyError) {
        console.error('Erro ao buscar empresa do usuário:', userCompanyError);
      }

      // Buscar informações do perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Compor a proposta completa com as informações adicionais
      const completeProposal = {
        ...data,
        user_companies: userCompanyData,
        user_profile: profileData
      } as unknown as Proposal;

      return completeProposal;
    },
  });
};
