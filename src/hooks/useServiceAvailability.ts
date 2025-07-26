
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceAvailability {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useServiceAvailability = () => {
  return useQuery({
    queryKey: ['service-availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return data as ServiceAvailability[];
    },
  });
};

export const useCreateServiceAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: Omit<ServiceAvailability, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('service_availability')
        .insert([availability])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability'] });
      toast.success('Disponibilidade adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar disponibilidade:', error);
      toast.error('Erro ao adicionar disponibilidade');
    },
  });
};

export const useUpdateServiceAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceAvailability> }) => {
      const { data, error } = await supabase
        .from('service_availability')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability'] });
      toast.success('Disponibilidade atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar disponibilidade:', error);
      toast.error('Erro ao atualizar disponibilidade');
    },
  });
};

export const useDeleteServiceAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability'] });
      toast.success('Disponibilidade removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar disponibilidade:', error);
      toast.error('Erro ao remover disponibilidade');
    },
  });
};
