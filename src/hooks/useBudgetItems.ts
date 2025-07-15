
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BudgetItem {
  id: string;
  proposal_id: string;
  type: 'material' | 'labor';
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export const useBudgetItems = (proposalId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budget-items', proposalId],
    queryFn: async () => {
      if (!user || !proposalId) return [];

      const { data, error } = await supabase
        .from('proposal_budget_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching budget items:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!proposalId,
  });
};

export const useCreateBudgetItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at' | 'total_price'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('proposal_budget_items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        console.error('Error creating budget item:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', data.proposal_id] });
    },
  });
};

export const useUpdateBudgetItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BudgetItem> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('proposal_budget_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget item:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', data.proposal_id] });
    },
  });
};

export const useDeleteBudgetItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, proposalId }: { id: string; proposalId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('proposal_budget_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget item:', error);
        throw error;
      }

      return { id, proposalId };
    },
    onSuccess: ({ proposalId }) => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', proposalId] });
    },
  });
};
