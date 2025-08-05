
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ServiceOrder {
  id: string;
  user_id: string;
  proposal_id: string;
  client_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  client_notes: string | null;
  provider_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateServiceOrderData {
  proposal_id: string;
  client_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  client_notes?: string;
}

export const useServiceOrders = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const serviceOrdersQuery = useQuery({
    queryKey: ['serviceOrders', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('User ID not provided');
      
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('user_id', targetUserId)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });
      
      if (error) throw error;
      return data as ServiceOrder[];
    },
    enabled: !!targetUserId,
  });

  const createServiceOrderMutation = useMutation({
    mutationFn: async (data: CreateServiceOrderData & { user_id: string }) => {
      const { data: serviceOrder, error } = await supabase
        .from('service_orders')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return serviceOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao realizar agendamento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateServiceOrderMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ServiceOrder>) => {
      const { data: serviceOrder, error } = await supabase
        .from('service_orders')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return serviceOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar agendamento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    serviceOrders: serviceOrdersQuery.data || [],
    isLoading: serviceOrdersQuery.isLoading,
    error: serviceOrdersQuery.error,
    createServiceOrder: createServiceOrderMutation.mutate,
    updateServiceOrder: updateServiceOrderMutation.mutate,
    isCreating: createServiceOrderMutation.isPending,
    isUpdating: updateServiceOrderMutation.isPending,
  };
};
