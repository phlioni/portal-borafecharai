
-- Criar tabela de segmentos de negócio
CREATE TABLE public.business_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_name TEXT NOT NULL,
    segment_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela business_segments
ALTER TABLE public.business_segments ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Public read access for business segments" 
ON public.business_segments FOR SELECT 
USING (true);

-- Inserir dados iniciais nos segmentos
INSERT INTO public.business_segments (segment_name, segment_order) VALUES
('Reformas e Construção', 1),
('Serviços Elétricos', 2),
('Serviços Hidráulicos', 3),
('Refrigeração e Climatização', 4),
('Eventos', 5),
('Marketing e Design', 6),
('Limpeza', 7),
('Transporte', 8),
('Consultoria', 9),
('Saúde e Bem-estar', 10),
('Tecnologia', 11);
