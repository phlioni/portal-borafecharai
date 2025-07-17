
-- Primeiro, vamos adicionar uma coluna para controlar quando o bônus foi concedido
-- e criar uma função para resetar o bônus mensal no plano essencial

-- Adicionar coluna para rastrear quando o bônus foi concedido
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS bonus_granted_at TIMESTAMPTZ;

-- Função para resetar bônus mensal do plano essencial
CREATE OR REPLACE FUNCTION public.reset_monthly_bonus()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Resetar bônus apenas para usuários do plano essencial/básico
  UPDATE public.subscribers
  SET 
    bonus_proposals_current_month = 0,
    updated_at = NOW()
  WHERE 
    subscribed = TRUE 
    AND subscription_tier = 'basico'
    AND bonus_proposals_current_month > 0;
END;
$$;

-- Atualizar função can_create_proposal para aplicar corretamente o bônus
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_subscriber RECORD;
  is_admin_user BOOLEAN;
  monthly_count INTEGER;
  bonus_proposals INTEGER;
  total_limit INTEGER;
BEGIN
  -- Verificar se é admin primeiro
  SELECT public.has_role(_user_id, 'admin') INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se é guest
  IF public.has_role(_user_id, 'guest') THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar dados do subscriber
  SELECT * INTO user_subscriber
  FROM public.subscribers 
  WHERE user_id = _user_id;
  
  -- Se não existe subscriber, não pode criar
  IF user_subscriber IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se tem assinatura ativa
  IF user_subscriber.subscribed = TRUE THEN
    CASE user_subscriber.subscription_tier
      WHEN 'basico' THEN
        -- Plano essencial: 10 propostas base + bônus do mês corrente
        SELECT public.get_monthly_proposal_count(_user_id) INTO monthly_count;
        bonus_proposals := COALESCE(user_subscriber.bonus_proposals_current_month, 0);
        total_limit := 10 + bonus_proposals;
        RETURN monthly_count < total_limit;
      WHEN 'profissional' THEN
        RETURN TRUE; -- Ilimitado
      WHEN 'equipes' THEN
        RETURN TRUE; -- Ilimitado
      ELSE
        RETURN FALSE;
    END CASE;
  END IF;
  
  -- Verificação do trial
  IF user_subscriber.trial_end_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF user_subscriber.trial_end_date < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Para trial: 20 propostas base + bônus (aplicado apenas uma vez durante todo o trial)
  bonus_proposals := COALESCE(user_subscriber.bonus_proposals_current_month, 0);
  total_limit := 20 + bonus_proposals;
  
  IF COALESCE(user_subscriber.trial_proposals_used, 0) >= total_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Se chegou até aqui, está em trial válido
  RETURN TRUE;
END;
$$;

-- Função para aplicar o bônus com as regras específicas
CREATE OR REPLACE FUNCTION public.grant_profile_completion_bonus(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_subscriber RECORD;
  is_complete BOOLEAN;
BEGIN
  -- Buscar dados do subscriber
  SELECT * INTO user_subscriber
  FROM public.subscribers
  WHERE user_id = _user_id;
  
  -- Se não existe subscriber, não pode conceder bônus
  IF user_subscriber IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se já foi reivindicado
  IF COALESCE(user_subscriber.profile_completion_bonus_claimed, FALSE) THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o perfil está completo
  SELECT public.is_profile_complete(_user_id) INTO is_complete;
  
  -- Se não está completo, retornar false
  IF NOT is_complete THEN
    RETURN FALSE;
  END IF;
  
  -- Conceder o bônus
  UPDATE public.subscribers
  SET 
    profile_completion_bonus_claimed = TRUE,
    bonus_proposals_current_month = 5, -- Sempre 5 propostas de bônus
    bonus_granted_at = NOW(),
    updated_at = NOW()
  WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;
