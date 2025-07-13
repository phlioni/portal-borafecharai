
-- Remover o constraint atual que está causando problemas
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;

-- Adicionar um novo constraint mais flexível
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('rascunho', 'enviada', 'visualizada', 'aceita', 'perdida'));
