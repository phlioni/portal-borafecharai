
-- Primeiro, vamos garantir que o trigger para novos usuários está funcionando
-- Vamos recriar a função de forma mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  ON CONFLICT (user_id) DO NOTHING; -- Evita duplicatas se já existir
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger para garantir que está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_trial();

-- Atualizar a função can_create_proposal para ser mais rigorosa
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_subscriber RECORD;
  is_admin_user BOOLEAN;
  monthly_count INTEGER;
BEGIN
  -- Verificar se é admin primeiro
  SELECT public.has_role(_user_id, 'admin') INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar dados do subscriber
  SELECT * INTO user_subscriber
  FROM public.subscribers 
  WHERE user_id = _user_id;
  
  -- Se não existe subscriber, não pode criar (falha de segurança)
  IF user_subscriber IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se tem assinatura ativa
  IF user_subscriber.subscribed = TRUE THEN
    CASE user_subscriber.subscription_tier
      WHEN 'basico' THEN
        SELECT public.get_monthly_proposal_count(_user_id) INTO monthly_count;
        RETURN monthly_count < 10;
      WHEN 'profissional' THEN
        RETURN TRUE; -- Ilimitado
      WHEN 'equipes' THEN
        RETURN TRUE; -- Ilimitado
      ELSE
        RETURN FALSE;
    END CASE;
  END IF;
  
  -- Verificação rigorosa do trial
  -- Deve ter trial_end_date válida E estar dentro do prazo E ter propostas disponíveis
  IF user_subscriber.trial_end_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF user_subscriber.trial_end_date < NOW() THEN
    RETURN FALSE;
  END IF;
  
  IF COALESCE(user_subscriber.trial_proposals_used, 0) >= 20 THEN
    RETURN FALSE;
  END IF;
  
  -- Se chegou até aqui, está em trial válido
  RETURN TRUE;
END;
$$;

-- Garantir que usuarios existentes sem trial tenham trial criado
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
)
SELECT 
  au.id,
  au.email,
  NOW(),
  NOW() + INTERVAL '15 days',
  0,
  FALSE,
  NULL,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.subscribers s ON s.user_id = au.id
WHERE s.user_id IS NULL;

-- Atualizar função de contagem de propostas do trial para ser mais precisa
CREATE OR REPLACE FUNCTION public.update_trial_proposal_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar contagem apenas se estiver em trial ativo e não subscrito
  UPDATE public.subscribers 
  SET 
    trial_proposals_used = COALESCE(trial_proposals_used, 0) + 1,
    updated_at = NOW()
  WHERE user_id = NEW.user_id 
    AND trial_end_date >= NOW()
    AND trial_start_date <= NOW()
    AND subscribed = FALSE;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger para contagem de propostas
DROP TRIGGER IF EXISTS update_trial_count_on_proposal_insert ON public.proposals;
CREATE TRIGGER update_trial_count_on_proposal_insert
  AFTER INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trial_proposal_count();
