
-- Verificar se as tabelas existem e têm dados
-- Se não tiverem dados, vamos garantir que elas tenham os dados corretos

-- Primeiro, vamos limpar dados existentes se houver
DELETE FROM public.business_types;
DELETE FROM public.business_segments;

-- Inserir os segmentos de atuação
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

-- Inserir os tipos para cada segmento
-- Reformas e Construção
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Reforma Residencial', 1 FROM public.business_segments WHERE segment_name = 'Reformas e Construção'
UNION ALL
SELECT id, 'Reforma Comercial', 2 FROM public.business_segments WHERE segment_name = 'Reformas e Construção'
UNION ALL
SELECT id, 'Construção Civil', 3 FROM public.business_segments WHERE segment_name = 'Reformas e Construção'
UNION ALL
SELECT id, 'Pintura', 4 FROM public.business_segments WHERE segment_name = 'Reformas e Construção'
UNION ALL
SELECT id, 'Marcenaria / Móveis Sob Medida', 5 FROM public.business_segments WHERE segment_name = 'Reformas e Construção';

-- Serviços Elétricos
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Instalação Elétrica', 1 FROM public.business_segments WHERE segment_name = 'Serviços Elétricos'
UNION ALL
SELECT id, 'Manutenção Elétrica', 2 FROM public.business_segments WHERE segment_name = 'Serviços Elétricos'
UNION ALL
SELECT id, 'Instalação de Iluminação', 3 FROM public.business_segments WHERE segment_name = 'Serviços Elétricos'
UNION ALL
SELECT id, 'Quadros e Disjuntores', 4 FROM public.business_segments WHERE segment_name = 'Serviços Elétricos'
UNION ALL
SELECT id, 'Automação Residencial', 5 FROM public.business_segments WHERE segment_name = 'Serviços Elétricos';

-- Serviços Hidráulicos
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Encanamento', 1 FROM public.business_segments WHERE segment_name = 'Serviços Hidráulicos'
UNION ALL
SELECT id, 'Desentupimento', 2 FROM public.business_segments WHERE segment_name = 'Serviços Hidráulicos'
UNION ALL
SELECT id, 'Manutenção Hidráulica', 3 FROM public.business_segments WHERE segment_name = 'Serviços Hidráulicos'
UNION ALL
SELECT id, 'Instalação de Aquecedores', 4 FROM public.business_segments WHERE segment_name = 'Serviços Hidráulicos'
UNION ALL
SELECT id, 'Bombas e Caixas d\'Água', 5 FROM public.business_segments WHERE segment_name = 'Serviços Hidráulicos';

-- Refrigeração e Climatização
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Instalação de Ar-condicionado', 1 FROM public.business_segments WHERE segment_name = 'Refrigeração e Climatização'
UNION ALL
SELECT id, 'Manutenção de Ar-condicionado', 2 FROM public.business_segments WHERE segment_name = 'Refrigeração e Climatização'
UNION ALL
SELECT id, 'Higienização de Ar-condicionado', 3 FROM public.business_segments WHERE segment_name = 'Refrigeração e Climatização'
UNION ALL
SELECT id, 'Instalação de Climatizadores', 4 FROM public.business_segments WHERE segment_name = 'Refrigeração e Climatização'
UNION ALL
SELECT id, 'Refrigeração Comercial', 5 FROM public.business_segments WHERE segment_name = 'Refrigeração e Climatização';

-- Eventos
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Buffet', 1 FROM public.business_segments WHERE segment_name = 'Eventos'
UNION ALL
SELECT id, 'Decoração', 2 FROM public.business_segments WHERE segment_name = 'Eventos'
UNION ALL
SELECT id, 'Locação de Estruturas', 3 FROM public.business_segments WHERE segment_name = 'Eventos'
UNION ALL
SELECT id, 'Fotografia e Filmagem', 4 FROM public.business_segments WHERE segment_name = 'Eventos'
UNION ALL
SELECT id, 'Som e Iluminação', 5 FROM public.business_segments WHERE segment_name = 'Eventos';

-- Marketing e Design
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Identidade Visual', 1 FROM public.business_segments WHERE segment_name = 'Marketing e Design'
UNION ALL
SELECT id, 'Redes Sociais', 2 FROM public.business_segments WHERE segment_name = 'Marketing e Design'
UNION ALL
SELECT id, 'Sites / Landing Pages', 3 FROM public.business_segments WHERE segment_name = 'Marketing e Design'
UNION ALL
SELECT id, 'Anúncios Online', 4 FROM public.business_segments WHERE segment_name = 'Marketing e Design'
UNION ALL
SELECT id, 'Edição de Vídeo', 5 FROM public.business_segments WHERE segment_name = 'Marketing e Design';

-- Limpeza
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Limpeza Residencial', 1 FROM public.business_segments WHERE segment_name = 'Limpeza'
UNION ALL
SELECT id, 'Limpeza Comercial', 2 FROM public.business_segments WHERE segment_name = 'Limpeza'
UNION ALL
SELECT id, 'Limpeza Pós-Obra', 3 FROM public.business_segments WHERE segment_name = 'Limpeza'
UNION ALL
SELECT id, 'Vidros e Fachadas', 4 FROM public.business_segments WHERE segment_name = 'Limpeza'
UNION ALL
SELECT id, 'Jardinagem', 5 FROM public.business_segments WHERE segment_name = 'Limpeza';

-- Transporte
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Mudanças', 1 FROM public.business_segments WHERE segment_name = 'Transporte'
UNION ALL
SELECT id, 'Cargas Leves', 2 FROM public.business_segments WHERE segment_name = 'Transporte'
UNION ALL
SELECT id, 'Entregas Rápidas', 3 FROM public.business_segments WHERE segment_name = 'Transporte'
UNION ALL
SELECT id, 'Transporte Comercial', 4 FROM public.business_segments WHERE segment_name = 'Transporte'
UNION ALL
SELECT id, 'Transporte Interestadual', 5 FROM public.business_segments WHERE segment_name = 'Transporte';

-- Consultoria
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Empresarial', 1 FROM public.business_segments WHERE segment_name = 'Consultoria'
UNION ALL
SELECT id, 'Financeira', 2 FROM public.business_segments WHERE segment_name = 'Consultoria'
UNION ALL
SELECT id, 'Marketing e Vendas', 3 FROM public.business_segments WHERE segment_name = 'Consultoria'
UNION ALL
SELECT id, 'Estratégica', 4 FROM public.business_segments WHERE segment_name = 'Consultoria'
UNION ALL
SELECT id, 'Treinamentos', 5 FROM public.business_segments WHERE segment_name = 'Consultoria';

-- Saúde e Bem-estar
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Personal Trainer', 1 FROM public.business_segments WHERE segment_name = 'Saúde e Bem-estar'
UNION ALL
SELECT id, 'Fisioterapia', 2 FROM public.business_segments WHERE segment_name = 'Saúde e Bem-estar'
UNION ALL
SELECT id, 'Estética', 3 FROM public.business_segments WHERE segment_name = 'Saúde e Bem-estar'
UNION ALL
SELECT id, 'Massoterapia', 4 FROM public.business_segments WHERE segment_name = 'Saúde e Bem-estar'
UNION ALL
SELECT id, 'Nutrição', 5 FROM public.business_segments WHERE segment_name = 'Saúde e Bem-estar';

-- Tecnologia
INSERT INTO public.business_types (segment_id, type_name, type_order)
SELECT id, 'Suporte Técnico', 1 FROM public.business_segments WHERE segment_name = 'Tecnologia'
UNION ALL
SELECT id, 'Redes e Wi-Fi', 2 FROM public.business_segments WHERE segment_name = 'Tecnologia'
UNION ALL
SELECT id, 'Desenvolvimento Web', 3 FROM public.business_segments WHERE segment_name = 'Tecnologia'
UNION ALL
SELECT id, 'Segurança Digital', 4 FROM public.business_segments WHERE segment_name = 'Tecnologia'
UNION ALL
SELECT id, 'Instalação de Servidores', 5 FROM public.business_segments WHERE segment_name = 'Tecnologia';
