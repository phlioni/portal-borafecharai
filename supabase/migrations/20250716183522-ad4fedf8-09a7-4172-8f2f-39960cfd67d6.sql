
-- Primeiro, vamos dropar o trigger existente que pode estar causando conflito
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_trial();

-- Recriar a função com melhor tratamento de conflitos
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
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();

-- Também vamos garantir que existe um índice único na tabela subscribers
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
