
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Erro ao carregar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async (dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('service_availability')
        .upsert({
          user_id: user.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
        });

      if (error) throw error;
      
      toast.success('Disponibilidade salva com sucesso');
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Erro ao salvar disponibilidade');
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  return {
    availability,
    loading,
    fetchAvailability,
    saveAvailability,
  };
};
