
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
      console.log('Fetching business segments...');
      
      const { data, error } = await supabase
        .from('business_segments')
        .select('*')
        .order('segment_order');

      if (error) {
        console.error('Error fetching business segments:', error);
        throw error;
      }

      console.log('Business segments data:', data);
      return data as BusinessSegment[];
    },
  });
};

export const useBusinessTypes = (segmentId?: string) => {
  return useQuery({
    queryKey: ['business-types', segmentId],
    queryFn: async () => {
      if (!segmentId) {
        console.log('No segmentId provided, returning empty array');
        return [];
      }

      console.log('Fetching business types for segment:', segmentId);

      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .eq('segment_id', segmentId)
        .order('type_order');

      if (error) {
        console.error('Error fetching business types:', error);
        throw error;
      }

      console.log('Business types data:', data);
      return data as BusinessType[];
    },
    enabled: !!segmentId,
  });
};
