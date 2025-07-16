
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessSegment {
  id: string;
  segment_name: string;
  segment_order: number;
}

export interface BusinessType {
  id: string;
  segment_id: string;
  type_name: string;
  type_order: number;
}

export const useBusinessSegments = () => {
  return useQuery({
    queryKey: ['business-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_segments' as any)
        .select('*')
        .order('segment_order');

      if (error) {
        console.error('Error fetching business segments:', error);
        throw error;
      }

      return (data as unknown) as BusinessSegment[];
    },
  });
};

export const useBusinessTypes = (segmentId?: string) => {
  return useQuery({
    queryKey: ['business-types', segmentId],
    queryFn: async () => {
      if (!segmentId) return [];

      const { data, error } = await supabase
        .from('business_types' as any)
        .select('*')
        .eq('segment_id', segmentId)
        .order('type_order');

      if (error) {
        console.error('Error fetching business types:', error);
        throw error;
      }

      return (data as unknown) as BusinessType[];
    },
    enabled: !!segmentId,
  });
};
