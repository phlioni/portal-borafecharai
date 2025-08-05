
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

export interface CreateAvailabilityData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

export const useServiceAvailability = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const availabilityQuery = useQuery({
    queryKey: ['serviceAvailability', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as ServiceAvailability[];
    },
    enabled: !!user,
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: CreateAvailabilityData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: availability, error } = await supabase
        .from('service_availability')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return availability;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceAvailability'] });
      toast({
        title: "Sucesso",
        description: "Horário de disponibilidade adicionado!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao adicionar disponibilidade: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateAvailabilityData>) => {
      const { data: availability, error } = await supabase
        .from('service_availability')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return availability;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceAvailability'] });
      toast({
        title: "Sucesso",
        description: "Horário de disponibilidade atualizado!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar disponibilidade: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_availability')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceAvailability'] });
      toast({
        title: "Sucesso",
        description: "Horário removido!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover horário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    availability: availabilityQuery.data || [],
    isLoading: availabilityQuery.isLoading,
    error: availabilityQuery.error,
    createAvailability: createAvailabilityMutation.mutate,
    updateAvailability: updateAvailabilityMutation.mutate,
    deleteAvailability: deleteAvailabilityMutation.mutate,
    isCreating: createAvailabilityMutation.isPending,
    isUpdating: updateAvailabilityMutation.isPending,
    isDeleting: deleteAvailabilityMutation.isPending,
  };
};
