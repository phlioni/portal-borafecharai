
-- Primeiro, vamos limpar qualquer função ou trigger problemático
DROP TRIGGER IF EXISTS update_business_types_updated_at ON public.business_types;
DROP FUNCTION IF EXISTS update_updated_at_business_types();

-- Verificar e deletar tabelas se existirem para recriá-las corretamente
DROP TABLE IF EXISTS public.business_types CASCADE;
DROP TABLE IF EXISTS public.business_segments CASCADE;

-- Criar tabela business_segments
CREATE TABLE public.business_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_name TEXT NOT NULL UNIQUE,
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

-- Criar tabela business_types
CREATE TABLE public.business_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_id UUID REFERENCES public.business_segments(id) ON DELETE CASCADE,
    type_name TEXT NOT NULL,
    type_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela business_types
ALTER TABLE public.business_types ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Public read access for business types" 
ON public.business_types FOR SELECT 
USING (true);

-- Inserir dados iniciais nos segmentos
INSERT INTO public.business_segments (segment_name, segment_order) VALUES
('Tecnologia da Informação', 1),
('Marketing Digital', 2),
('Consultoria Empresarial', 3),
('Design e Criatividade', 4),
('Educação e Treinamento', 5),
('Saúde e Bem-estar', 6),
('Finanças e Contabilidade', 7),
('Engenharia e Construção', 8),
('Varejo e E-commerce', 9),
('Serviços Profissionais', 10);

-- Inserir dados iniciais nos tipos de negócio
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT 
    s.id,
    unnest(ARRAY[
        CASE s.segment_name
            WHEN 'Tecnologia da Informação' THEN ARRAY['Desenvolvimento Web', 'Mobile Apps', 'Software Personalizado', 'Suporte Técnico']
            WHEN 'Marketing Digital' THEN ARRAY['SEO/SEM', 'Redes Sociais', 'E-mail Marketing', 'Gestão de Tráfego']
            WHEN 'Consultoria Empresarial' THEN ARRAY['Estratégia', 'Processos', 'RH', 'Vendas']
            WHEN 'Design e Criatividade' THEN ARRAY['Design Gráfico', 'UX/UI', 'Branding', 'Fotografia']
            WHEN 'Educação e Treinamento' THEN ARRAY['Cursos Online', 'Treinamentos', 'Mentoria', 'Workshops']
            WHEN 'Saúde e Bem-estar' THEN ARRAY['Consultoria Nutricional', 'Personal Training', 'Terapias', 'Coaching']
            WHEN 'Finanças e Contabilidade' THEN ARRAY['Contabilidade', 'Planejamento Financeiro', 'Auditoria', 'Impostos']
            WHEN 'Engenharia e Construção' THEN ARRAY['Projetos', 'Consultoria Técnica', 'Gestão de Obras', 'Laudos']
            WHEN 'Varejo e E-commerce' THEN ARRAY['Loja Virtual', 'Marketplace', 'Gestão de Estoque', 'Logística']
            WHEN 'Serviços Profissionais' THEN ARRAY['Jurídico', 'Tradução', 'Redação', 'Advocacia']
        END
    ]),
    generate_series(1, 4)
FROM public.business_segments s;

-- Função para atualizar updated_at (nome correto)
CREATE OR REPLACE FUNCTION update_updated_at_business_tables()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_business_segments_updated_at
    BEFORE UPDATE ON public.business_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_business_tables();

CREATE TRIGGER update_business_types_updated_at
    BEFORE UPDATE ON public.business_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_business_tables();
