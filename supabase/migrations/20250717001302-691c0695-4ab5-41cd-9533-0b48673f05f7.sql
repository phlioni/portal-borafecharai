
-- Create RPC function to get business types by segment
CREATE OR REPLACE FUNCTION get_business_types_by_segment(segment_id UUID)
RETURNS TABLE (
  id UUID,
  segment_id UUID,
  type_name TEXT,
  type_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    bt.id,
    bt.segment_id,
    bt.type_name,
    bt.type_order,
    bt.created_at,
    bt.updated_at
  FROM public.business_types bt
  WHERE bt.segment_id = $1
  ORDER BY bt.type_order;
$$;
