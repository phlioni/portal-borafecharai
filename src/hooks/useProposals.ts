
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type Proposal = Tables<'proposals'>;
type ProposalInsert = TablesInsert<'proposals'>;

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      return data;
    },
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: ProposalInsert) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert(proposal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
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
    },
  });
};
