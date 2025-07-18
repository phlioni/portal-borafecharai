
-- Adicionar campo subscription_started_at na tabela subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

-- Atualizar registros existentes para definir subscription_started_at para usuários já assinantes
UPDATE public.subscribers 
SET subscription_started_at = updated_at 
WHERE subscribed = TRUE AND subscription_started_at IS NULL;
