
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar disponibilidade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async (dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('service_availability')
        .upsert({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
        }, {
          onConflict: 'user_id,day_of_week'
        });

      if (error) throw error;
      
      await fetchAvailability();
      toast({
        title: "Sucesso",
        description: "Disponibilidade salva com sucesso",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar disponibilidade",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  return {
    availability,
    loading,
    saveAvailability,
    refetch: fetchAvailability,
  };
};
