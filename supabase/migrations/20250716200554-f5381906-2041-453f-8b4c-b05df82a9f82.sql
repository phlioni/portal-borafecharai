
-- Primeiro, vamos garantir que o trigger está funcionando corretamente
-- Vamos recriar a função com melhor tratamento de erros e logging

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_trial();

-- Recriar a função com trial de 15 dias (conforme o código atual do sistema)
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Log para debug
  RAISE LOG 'Criando trial para novo usuário: %', NEW.id;
  
  -- Inserir automaticamente um subscriber com trial de 15 dias para todo novo usuário
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
    NOW() + INTERVAL '15 days',
    0,
    FALSE,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    trial_start_date = CASE 
      WHEN subscribers.trial_start_date IS NULL THEN EXCLUDED.trial_start_date
      ELSE subscribers.trial_start_date
    END,
    trial_end_date = CASE 
      WHEN subscribers.trial_end_date IS NULL THEN EXCLUDED.trial_end_date
      ELSE subscribers.trial_end_date
    END,
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RAISE LOG 'Trial criado com sucesso para usuário: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia a criação do usuário
    RAISE LOG 'Erro ao criar subscriber para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();

-- Corrigir o usuário atual que não tem trial configurado
-- Atualizar apenas usuários que não têm trial_start_date configurado
UPDATE public.subscribers 
SET 
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '15 days',
  trial_proposals_used = 0,
  updated_at = NOW()
WHERE user_id IN (
  SELECT user_id 
  FROM public.subscribers 
  WHERE trial_start_date IS NULL 
    AND subscribed = FALSE 
    AND subscription_tier IS NULL
)
AND trial_start_date IS NULL;
