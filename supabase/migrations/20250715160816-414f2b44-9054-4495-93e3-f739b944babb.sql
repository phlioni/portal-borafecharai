
-- Adicionar a coluna user_profile na tabela telegram_sessions se não existir
ALTER TABLE public.telegram_sessions 
ADD COLUMN IF NOT EXISTS user_profile JSONB DEFAULT '{}';

-- Atualizar o comentário da coluna
COMMENT ON COLUMN public.telegram_sessions.user_profile IS 'Perfil do usuário em formato JSON';
