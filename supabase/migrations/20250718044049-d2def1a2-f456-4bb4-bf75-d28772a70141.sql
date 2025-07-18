
-- Corrigir função get_monthly_proposal_count para considerar apenas propostas após subscription_started_at
CREATE OR REPLACE FUNCTION public.get_monthly_proposal_count(_user_id uuid, _month date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_subscriber RECORD;
  monthly_count INTEGER;
BEGIN
  -- Buscar dados do subscriber
  SELECT * INTO user_subscriber
  FROM public.subscribers 
  WHERE user_id = _user_id;
  
  -- Se não existe subscriber ou não tem assinatura ativa, retornar contagem total
  IF user_subscriber IS NULL OR user_subscriber.subscribed = FALSE THEN
    SELECT COUNT(*)::INTEGER INTO monthly_count
    FROM public.proposals
    WHERE user_id = _user_id
      AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', _month)::DATE;
    
    RETURN monthly_count;
  END IF;
  
  -- Para usuários com assinatura ativa do plano básico, considerar apenas propostas após subscription_started_at
  IF user_subscriber.subscription_tier = 'basico' AND user_subscriber.subscription_started_at IS NOT NULL THEN
    -- Contar apenas propostas feitas após o início da assinatura no mês atual
    SELECT COUNT(*)::INTEGER INTO monthly_count
    FROM public.proposals
    WHERE user_id = _user_id
      AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', _month)::DATE
      AND created_at >= user_subscriber.subscription_started_at;
    
    RETURN monthly_count;
  END IF;
  
  -- Para outros planos (profissional, etc), retornar contagem total
  SELECT COUNT(*)::INTEGER INTO monthly_count
  FROM public.proposals
  WHERE user_id = _user_id
    AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', _month)::DATE;
  
  RETURN monthly_count;
END;
$$;
