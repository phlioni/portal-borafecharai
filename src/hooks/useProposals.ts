
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  service_description: string;
  observations: string;
  detailed_description: string;
  payment_terms: string;
  delivery_time: string;
  total_amount: number;
  value: number;
  validity_date: string;
  status: string;
  template_id: string;
  proposal_number: string;
  public_hash: string;
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
  views: number;
  company_profile: any;
  user_profile: any;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  clients?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  user_companies?: any;
  companies?: any;
  profiles?: {
    id: string;
    name?: string;
    phone?: string;
    avatar_url?: string;
  };
  proposal_budget_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    type: string;
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
          user_companies (
            name,
            logo_url,
            address,
            phone,
            email,
            website
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
            total_price,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(proposal => ({
        ...proposal,
        client: proposal.clients,
        clients: proposal.clients
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
            phone
          ),
          user_companies (
            name,
            logo_url,
            address,
            phone,
            email,
            website
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
            total_price,
            type
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const proposal = {
        ...data,
        client: data.clients,
        clients: data.clients
      };
      
      return proposal as unknown as Proposal;
    },
    enabled: !!id,
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'last_viewed_at' | 'views' | 'client' | 'clients' | 'user_profile' | 'company_profile' | 'proposal_budget_items' | 'public_hash' | 'profiles' | 'user_companies' | 'companies'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const proposalWithUserId = {
        ...proposal,
        user_id: user.id,
        title: proposal.title || '',
        payment_terms: proposal.payment_terms || null,
        total_amount: proposal.total_amount || 0
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
      // Use a direct update query instead of RPC function
      const { data, error } = await supabase
        .from('proposals')
        .update({ 
          views: supabase.raw('views + 1'),
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar visualizações da proposta:', error);
    },
  });
};
