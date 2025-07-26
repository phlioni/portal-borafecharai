import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string;
  service_description: string;
  observations: string;
  detailed_description: string;
  payment_terms: string;
  delivery_time: string;
  total_amount: number;
  status: string;
  public_hash: string;
  created_at: string;
  last_viewed_at: string | null;
  views: number;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  user_profile?: {
    id: string;
    name?: string;
    phone?: string;
    avatar_url?: string;
  };
  company_profile?: any;
  proposal_budget_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
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
            phone,
            company
          ),
          profiles!proposals_user_id_fkey (
            id,
            name,
            phone,
            avatar_url
          ),
          companies (
            name,
            logo_url,
            address,
            phone,
            email,
            website
          ),
          proposal_budget_items (
            id,
            description,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(proposal => ({
        ...proposal,
        client: proposal.clients,
        user_profile: proposal.profiles ? {
          id: proposal.profiles.id,
          name: proposal.profiles.name,
          phone: proposal.profiles.phone,
          avatar_url: proposal.profiles.avatar_url
        } : undefined,
        company_profile: proposal.companies
      })) as unknown as Proposal[];
    },
  });
};

export const useProposal = (id: string) => {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            company
          ),
          profiles!proposals_user_id_fkey (
            id,
            name,
            phone,
            avatar_url
          ),
          companies (
            name,
            logo_url,
            address,
            phone,
            email,
            website
          ),
          proposal_budget_items (
            id,
            description,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const proposal = {
        ...data,
        client: data.clients,
        user_profile: data.profiles ? {
          id: data.profiles.id,
          name: data.profiles.name,
          phone: data.profiles.phone,
          avatar_url: data.profiles.avatar_url
        } : undefined,
        company_profile: data.companies
      };
      
      return proposal as unknown as Proposal;
    },
    enabled: !!id,
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: Omit<Proposal, 'id' | 'created_at' | 'last_viewed_at' | 'views' | 'client' | 'user_profile' | 'company_profile' | 'proposal_budget_items' | 'public_hash'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const proposalWithUserId = {
        ...proposal,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert([proposalWithUserId])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar proposta:', error);
      toast.error('Erro ao criar proposta');
    },
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proposal> }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta atualizada com sucesso!');
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
      toast.success('Proposta removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar proposta:', error);
      toast.error('Erro ao remover proposta');
    },
  });
};

export const useUpdateProposalViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('increment_proposal_views', { row_id: id })
        .select()

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar visualizações da proposta:', error);
    },
  });
};
