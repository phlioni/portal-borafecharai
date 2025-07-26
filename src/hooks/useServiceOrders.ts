
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceOrder {
  id: string;
  user_id: string;
  proposal_id: string;
  client_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: 'agendado' | 'confirmado' | 'reagendamento_solicitado' | 'concluido' | 'cancelado';
  client_notes: string | null;
  provider_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  proposals?: {
    title: string;
    clients?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
}

export const useServiceOrders = () => {
  return useQuery({
    queryKey: ['service-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          proposals (
            title,
            clients (
              name,
              email,
              phone
            )
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as ServiceOrder[];
    },
  });
};

export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: {
      proposal_id: string;
      client_id?: string;
      scheduled_date: string;
      scheduled_time: string;
      client_notes?: string;
    }) => {
      // Para ordens criadas via proposta pública, buscar o user_id da proposta
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('user_id')
        .eq('id', order.proposal_id)
        .single();

      if (proposalError || !proposal) {
        throw new Error('Proposta não encontrada');
      }

      const orderWithUserId = {
        ...order,
        user_id: proposal.user_id
      };

      const { data, error } = await supabase
        .from('service_orders')
        .insert([orderWithUserId])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      toast.success('Ordem de serviço criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar ordem de serviço:', error);
      toast.error('Erro ao criar ordem de serviço');
    },
  });
};

export const useUpdateServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceOrder> }) => {
      const { data, error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      toast.success('Ordem de serviço atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar ordem de serviço:', error);
      toast.error('Erro ao atualizar ordem de serviço');
    },
  });
};
