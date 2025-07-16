
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
      
      // Use rpc or direct SQL to bypass type checking
      const { data, error } = await supabase
        .rpc('get_business_segments');

      if (error) {
        console.error('Error fetching business segments:', error);
        // Fallback to direct query with any type
        const { data: fallbackData, error: fallbackError } = await (supabase as any)
          .from('business_segments')
          .select('*')
          .order('segment_order');
        
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          throw fallbackError;
        }
        
        console.log('Business segments fallback data:', fallbackData);
        return fallbackData as BusinessSegment[];
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

      // Use rpc or direct SQL to bypass type checking
      const { data, error } = await supabase
        .rpc('get_business_types', { segment_id: segmentId });

      if (error) {
        console.error('Error fetching business types:', error);
        // Fallback to direct query with any type
        const { data: fallbackData, error: fallbackError } = await (supabase as any)
          .from('business_types')
          .select('*')
          .eq('segment_id', segmentId)
          .order('type_order');
        
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          throw fallbackError;
        }
        
        console.log('Business types fallback data:', fallbackData);
        return fallbackData as BusinessType[];
      }

      console.log('Business types data:', data);
      return data as BusinessType[];
    },
    enabled: !!segmentId,
  });
};
