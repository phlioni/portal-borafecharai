
-- Atualizar função get_monthly_proposal_count para considerar apenas propostas após assinatura
CREATE OR REPLACE FUNCTION public.get_monthly_proposal_count(_user_id uuid, _month date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_subscriber RECORD;
  subscription_start_date TIMESTAMPTZ;
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
  
  -- Para usuários com assinatura ativa do plano básico, considerar apenas propostas após a assinatura
  IF user_subscriber.subscription_tier = 'basico' THEN
    -- Usar a data de atualização quando mudou para subscribed = true como referência
    -- ou usar subscription_end menos 1 mês como data de início aproximada
    IF user_subscriber.subscription_end IS NOT NULL THEN
      subscription_start_date := user_subscriber.subscription_end - INTERVAL '1 month';
    ELSE
      subscription_start_date := user_subscriber.updated_at;
    END IF;
    
    -- Contar apenas propostas feitas após o início da assinatura no mês atual
    SELECT COUNT(*)::INTEGER INTO monthly_count
    FROM public.proposals
    WHERE user_id = _user_id
      AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', _month)::DATE
      AND created_at >= subscription_start_date;
    
    RETURN monthly_count;
  END IF;
  
  -- Para outros planos (profissional, etc), retornar contagem total (ilimitado mesmo assim)
  SELECT COUNT(*)::INTEGER INTO monthly_count
  FROM public.proposals
  WHERE user_id = _user_id
    AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', _month)::DATE;
  
  RETURN monthly_count;
END;
$$;

-- Adicionar campo para marcar quando a assinatura começou
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

-- Atualizar registros existentes para definir subscription_started_at
UPDATE public.subscribers 
SET subscription_started_at = updated_at 
WHERE subscribed = TRUE AND subscription_started_at IS NULL;
