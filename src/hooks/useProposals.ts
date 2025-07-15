import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Proposal {
  id: string;
  title: string;
  value: number;
  status: string;
  created_at: string;
  updated_at: string;
  service_description?: string;
  detailed_description?: string;
  delivery_time?: string;
  validity_date?: string;
  observations?: string;
  template_id?: string;
  public_hash?: string;
  views?: number;
  last_viewed_at?: string;
  company_id?: string;
  user_id: string;
  companies?: {
    name: string;
    email?: string;
    phone?: string;
  };
  proposal_budget_items?: {
    id: string;
    type: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export const useProposals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          companies (
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateProposal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('proposals')
        .insert([proposalData])
        .select(`
          *,
          companies (
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
        .single();

      if (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
};

export const useUpdateProposal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proposal> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          companies (
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
        .single();

      if (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
};

// Legacy hook for backward compatibility
export const useProposal = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    if (!user) {
      setProposals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          companies (
            name,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        return;
      }

      console.log('Fetched proposals for user:', user.id, data?.length || 0);
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          ...proposalData,
          user_id: user.id
        }])
        .select(`
          *,
          companies (
            name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }

      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          companies (
            name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }

      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  };

  const deleteProposal = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting proposal:', error);
        throw error;
      }

      await fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  return {
    proposals,
    loading,
    fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal
  };
};
