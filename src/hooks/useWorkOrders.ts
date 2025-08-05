
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface WorkOrder {
  id: string;
  proposal_id: string | null;
  client_id: string;
  user_id: string;
  scheduled_at: string;
  address: string;
  status: 'pending_approval' | 'approved' | 'rescheduled' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderData {
  proposal_id?: string;
  client_id: string;
  scheduled_at: string;
  address: string;
}

export const useWorkOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({
    queryKey: ['workOrders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkOrder[];
    },
    enabled: !!user,
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: async (data: CreateWorkOrderData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return workOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      toast({
        title: "Sucesso",
        description: "Ordem de serviço criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar ordem de serviço: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateWorkOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WorkOrder['status'] }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      toast({
        title: "Sucesso",
        description: "Status da ordem de serviço atualizado!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    workOrders: workOrdersQuery.data || [],
    isLoading: workOrdersQuery.isLoading,
    error: workOrdersQuery.error,
    createWorkOrder: createWorkOrderMutation.mutate,
    updateWorkOrderStatus: updateWorkOrderStatusMutation.mutate,
    isCreating: createWorkOrderMutation.isPending,
    isUpdating: updateWorkOrderStatusMutation.isPending,
  };
};
