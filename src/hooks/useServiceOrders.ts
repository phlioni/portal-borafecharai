
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceOrder {
  id: string;
  user_id: string;
  proposal_id: string;
  client_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: 'agendado' | 'reagendado' | 'finalizado' | 'cancelado';
  client_notes: string | null;
  provider_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  proposals?: {
    id: string;
    title: string;
    value: number;
    client_id: string;
    clients?: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export const useServiceOrders = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          proposals (
            id,
            title,
            value,
            client_id,
            clients (
              name,
              email,
              phone
            )
          )
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setOrders(data as ServiceOrder[]);
    } catch (error) {
      console.error('Error fetching service orders:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar ordens de serviço",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, updates: Partial<ServiceOrder>) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchOrders();
      toast({
        title: "Sucesso",
        description: "Ordem de serviço atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating service order:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ordem de serviço",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchOrders();
      toast({
        title: "Sucesso",
        description: "Ordem de serviço excluída com sucesso",
      });
    } catch (error) {
      console.error('Error deleting service order:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir ordem de serviço",
        variant: "destructive",
      });
    }
  };

  const completeOrder = async (id: string) => {
    await updateOrder(id, {
      status: 'finalizado',
      completed_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    updateOrder,
    deleteOrder,
    completeOrder,
    refetch: fetchOrders,
  };
};
