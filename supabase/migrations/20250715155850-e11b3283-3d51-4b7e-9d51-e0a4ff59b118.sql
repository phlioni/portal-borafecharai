
-- Verificar se a tabela profiles tem todas as colunas necessárias
-- e adicionar índices para melhor performance na busca por telefone

-- Criar índice para busca por telefone na tabela profiles (se não existir)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Verificar se existe alguma configuração de sistema para IA
-- Se não existir, vamos criar uma entrada para configurações do sistema
INSERT INTO public.system_settings (user_id, setting_key, setting_value, created_at, updated_at)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'admin@borafecharai.com' LIMIT 1),
  'telegram_bot_ai_enabled',
  'true'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_settings 
  WHERE setting_key = 'telegram_bot_ai_enabled'
);
