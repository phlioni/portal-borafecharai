
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessSegment {
  id: string;
  segment_name: string;
  segment_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface BusinessType {
  id: string;
  segment_id: string;
  type_name: string;
  type_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export const useBusinessSegments = () => {
  return useQuery({
    queryKey: ['business-segments'],
    queryFn: async (): Promise<BusinessSegment[]> => {
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
      return data || [];
    },
  });
};

export const useBusinessTypes = (segmentId?: string) => {
  return useQuery({
    queryKey: ['business-types', segmentId],
    queryFn: async (): Promise<BusinessType[]> => {
      if (!segmentId) {
        console.log('No segmentId provided, returning empty array');
        return [];
      }

      console.log('Fetching business types for segment:', segmentId);

      // Use rpc function with any type to avoid TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .rpc('get_business_types_by_segment', { segment_id: segmentId });

      if (error) {
        console.error('Error fetching business types:', error);
        throw error;
      }

      console.log('Business types data:', data);
      return data || [];
    },
    enabled: !!segmentId,
  });
};
