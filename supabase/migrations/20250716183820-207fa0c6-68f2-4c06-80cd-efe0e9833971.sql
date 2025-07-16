
-- Vamos verificar e corrigir a estrutura da tabela subscribers
-- Primeiro, vamos garantir que temos uma constraint única correta

-- Dropar índice duplicado se existir
DROP INDEX IF EXISTS idx_subscribers_user_id;

-- Garantir que existe uma constraint única correta na coluna user_id
DO $$
BEGIN
    -- Verificar se já existe uma constraint única em user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscribers_user_id_key' 
        AND contype = 'u'
    ) THEN
        ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Recriar a função com tratamento mais robusto
DROP FUNCTION IF EXISTS public.handle_new_user_trial() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir automaticamente um subscriber com trial de 30 dias para todo novo usuário
  INSERT INTO public.subscribers (
    user_id,
    email,
    trial_start_date,
    trial_end_date,
    trial_proposals_used,
    subscribed,
    subscription_tier,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW() + INTERVAL '30 days',
    0,
    FALSE,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    trial_start_date = CASE 
      WHEN subscribers.trial_start_date IS NULL THEN EXCLUDED.trial_start_date
      ELSE subscribers.trial_start_date
    END,
    trial_end_date = CASE 
      WHEN subscribers.trial_end_date IS NULL THEN EXCLUDED.trial_end_date
      ELSE subscribers.trial_end_date
    END,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia a criação do usuário
    RAISE LOG 'Erro ao criar subscriber para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();
