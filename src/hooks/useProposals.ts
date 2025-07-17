
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

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
  views?: number;
  last_viewed_at?: string;
  public_hash?: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
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
            quantity,
            unit_price,
            total_price,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      return data as Proposal[];
    },
    enabled: !!user?.id,
  });
};

// Hook específico para buscar uma proposta individual
export const useProposal = (id: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Não fazer query se o ID for inválido ou 'nova'
      if (!id || id === 'nova' || id === 'temp-proposal') {
        return null;
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
            quantity,
            unit_price,
            total_price,
            type
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching proposal:', error);
        throw error;
      }

      return data as Proposal;
    },
    enabled: !!user?.id && !!id && id !== 'nova' && id !== 'temp-proposal',
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          ...proposalData,
          user_id: user.id
        }])
        .select()
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
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Proposal> & { id: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('proposals')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', data.id] });
    },
  });
};

export const useDeleteProposal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting proposal:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
};
