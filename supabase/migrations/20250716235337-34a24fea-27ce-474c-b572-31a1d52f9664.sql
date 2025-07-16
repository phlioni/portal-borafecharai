
-- Criar função RPC para buscar business segments
CREATE OR REPLACE FUNCTION get_business_segments()
RETURNS TABLE (
  id UUID,
  segment_name TEXT,
  segment_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    bs.id,
    bs.segment_name,
    bs.segment_order,
    bs.created_at,
    bs.updated_at
  FROM public.business_segments bs
  ORDER BY bs.segment_order;
$$;

-- Criar função RPC para buscar business types por segment_id
CREATE OR REPLACE FUNCTION get_business_types(segment_id_param UUID)
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
AS $$
  SELECT 
    bt.id,
    bt.segment_id,
    bt.type_name,
    bt.type_order,
    bt.created_at,
    bt.updated_at
  FROM public.business_types bt
  WHERE bt.segment_id = segment_id_param
  ORDER BY bt.type_order;
$$;
