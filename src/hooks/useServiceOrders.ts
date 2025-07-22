
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ServiceOrder {
  id: string;
  user_id: string;
  proposal_id: string;
  client_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'agendado' | 'reagendado' | 'finalizado' | 'cancelado';
  client_notes?: string;
  provider_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  proposals?: {
    title: string;
    value: number;
    clients?: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export const useServiceOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          proposals (
            title,
            value,
            clients (
              name,
              email,
              phone
            )
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching service orders:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<ServiceOrder>) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Ordem de serviço atualizada com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error updating service order:', error);
      toast.error('Erro ao atualizar ordem de serviço');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Ordem de serviço excluída com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting service order:', error);
      toast.error('Erro ao excluir ordem de serviço');
    }
  };

  const completeOrder = async (orderId: string, providerNotes?: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'finalizado',
          completed_at: new Date().toISOString(),
          provider_notes: providerNotes,
        })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Ordem de serviço finalizada com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error completing service order:', error);
      toast.error('Erro ao finalizar ordem de serviço');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    fetchOrders,
    updateOrder,
    deleteOrder,
    completeOrder,
  };
};
