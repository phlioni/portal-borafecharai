
-- Atualizar função can_create_proposal para usar a mesma lógica de contagem
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_subscriber RECORD;
  user_trial_limits RECORD;
  is_admin_user BOOLEAN;
  is_guest_user BOOLEAN;
  monthly_count INTEGER;
  bonus_proposals INTEGER;
  total_limit INTEGER;
BEGIN
  -- Verificar se é admin primeiro (incluindo admin principal)
  SELECT public.has_role(_user_id, 'admin') INTO is_admin_user;
  
  -- Verificar se é o admin principal pelo email
  IF NOT is_admin_user THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = _user_id AND email = 'admin@borafecharai.com'
    ) INTO is_admin_user;
  END IF;
  
  IF is_admin_user THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se é guest
  SELECT public.has_role(_user_id, 'guest') INTO is_guest_user;
  
  IF is_guest_user THEN
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
  
  -- Se tem assinatura ativa, usar lógica da tabela subscribers
  IF user_subscriber.subscribed = TRUE THEN
    CASE user_subscriber.subscription_tier
      WHEN 'basico' THEN
        -- Plano essencial: usar a função get_monthly_proposal_count que já considera subscription_started_at
        SELECT public.get_monthly_proposal_count(_user_id) INTO monthly_count;
        bonus_proposals := COALESCE(user_subscriber.bonus_proposals_current_month, 0);
        total_limit := 10 + bonus_proposals;
        RETURN monthly_count < total_limit;
      WHEN 'profissional' THEN
        RETURN TRUE; -- Ilimitado
      WHEN 'equipes' THEN
        RETURN TRUE; -- Ilimitado
      ELSE
        RETURN FALSE; -- Tier desconhecido
    END CASE;
  END IF;
  
  -- Para trial, verificar se ainda está válido
  IF user_subscriber.trial_end_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF user_subscriber.trial_end_date < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar limites específicos do trial
  SELECT * INTO user_trial_limits
  FROM public.trial_limits
  WHERE user_id = _user_id;
  
  -- Se não tem trial_limits configurado, usar padrão
  IF user_trial_limits IS NULL THEN
    total_limit := 20; -- Padrão
  ELSE
    total_limit := user_trial_limits.trial_proposals_limit;
  END IF;
  
  -- Adicionar bônus (aplicado apenas uma vez durante todo o trial)
  bonus_proposals := COALESCE(user_subscriber.bonus_proposals_current_month, 0);
  total_limit := total_limit + bonus_proposals;
  
  -- Verificar se não excedeu o limite
  IF COALESCE(user_subscriber.trial_proposals_used, 0) >= total_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Se chegou até aqui, está em trial válido e pode criar
  RETURN TRUE;
END;
$$;
