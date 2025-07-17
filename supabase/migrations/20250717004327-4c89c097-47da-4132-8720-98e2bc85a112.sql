
-- Adicionar coluna para controlar se o usuário já ganhou o bônus de preenchimento de perfil
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS profile_completion_bonus_claimed BOOLEAN DEFAULT FALSE;

-- Adicionar coluna para armazenar propostas extras ganhas por bônus
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS bonus_proposals_current_month INTEGER DEFAULT 0;

-- Função para verificar se o perfil está completo
CREATE OR REPLACE FUNCTION public.is_profile_complete(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  profile_complete BOOLEAN := FALSE;
  company_complete BOOLEAN := FALSE;
BEGIN
  -- Verificar perfil (name e phone são obrigatórios)
  SELECT (name IS NOT NULL AND name != '' AND phone IS NOT NULL AND phone != '')
  INTO profile_complete
  FROM public.profiles 
  WHERE user_id = _user_id;
  
  -- Verificar empresa (todos os campos exceto logo_url, website, cnpj e description)
  SELECT (
    name IS NOT NULL AND name != '' AND
    email IS NOT NULL AND email != '' AND
    phone IS NOT NULL AND phone != '' AND
    address IS NOT NULL AND address != '' AND
    city IS NOT NULL AND city != '' AND
    state IS NOT NULL AND state != '' AND
    zip_code IS NOT NULL AND zip_code != '' AND
    business_segment IS NOT NULL AND business_segment != '' AND
    business_type_detail IS NOT NULL AND business_type_detail != ''
  )
  INTO company_complete
  FROM public.companies 
  WHERE user_id = _user_id;
  
  RETURN COALESCE(profile_complete, FALSE) AND COALESCE(company_complete, FALSE);
END;
$$;

-- Função para conceder bônus de perfil completo
CREATE OR REPLACE FUNCTION public.grant_profile_completion_bonus(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_claimed BOOLEAN;
  is_complete BOOLEAN;
BEGIN
  -- Verificar se já foi reivindicado
  SELECT COALESCE(profile_completion_bonus_claimed, FALSE)
  INTO already_claimed
  FROM public.subscribers
  WHERE user_id = _user_id;
  
  -- Se já foi reivindicado, retornar false
  IF already_claimed THEN
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
    bonus_proposals_current_month = COALESCE(bonus_proposals_current_month, 0) + 5,
    updated_at = NOW()
  WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;

-- Atualizar função can_create_proposal para considerar propostas bônus
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
  
  -- Verificação rigorosa do trial
  -- Deve ter trial_end_date válida E estar dentro do prazo E ter propostas disponíveis
  IF user_subscriber.trial_end_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF user_subscriber.trial_end_date < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Para trial, considerar propostas bônus também
  bonus_proposals := COALESCE(user_subscriber.bonus_proposals_current_month, 0);
  total_limit := 20 + bonus_proposals;
  
  IF COALESCE(user_subscriber.trial_proposals_used, 0) >= total_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Se chegou até aqui, está em trial válido
  RETURN TRUE;
END;
$$;
