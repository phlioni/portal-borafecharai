
-- Criar tabela para gerenciar limites de trial por usuário
CREATE TABLE public.trial_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_days_limit INTEGER NOT NULL DEFAULT 15,
  trial_proposals_limit INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.trial_limits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own trial limits" 
  ON public.trial_limits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all trial limits" 
  ON public.trial_limits 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_trial_limits_updated_at
  BEFORE UPDATE ON public.trial_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar trial_limit automaticamente quando um subscriber for criado
CREATE OR REPLACE FUNCTION public.handle_new_trial_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir automaticamente trial_limits apenas para usuários em trial (sem assinatura)
  IF NEW.subscribed = FALSE AND NEW.trial_start_date IS NOT NULL THEN
    INSERT INTO public.trial_limits (
      user_id,
      trial_days_limit,
      trial_proposals_limit,
      created_at,
      updated_at
    ) VALUES (
      NEW.user_id,
      15, -- Padrão de 15 dias
      20, -- Padrão de 20 propostas
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar trial_limits quando subscriber for criado
CREATE TRIGGER create_trial_limits_on_subscriber_insert
  AFTER INSERT ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_trial_limit();

-- Inserir trial_limits para usuários existentes que estão em trial
INSERT INTO public.trial_limits (user_id, trial_days_limit, trial_proposals_limit)
SELECT 
  s.user_id,
  15, -- Padrão de 15 dias
  20  -- Padrão de 20 propostas
FROM public.subscribers s
WHERE s.subscribed = FALSE 
  AND s.trial_start_date IS NOT NULL
  AND s.trial_end_date >= NOW()
  AND NOT EXISTS (
    SELECT 1 FROM public.trial_limits tl WHERE tl.user_id = s.user_id
  );

-- Atualizar função can_create_proposal para usar trial_limits
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
  
  -- Se tem assinatura ativa, usar lógica da tabela subscribers
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
  
  -- Para trial, usar trial_limits
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
  
  IF COALESCE(user_subscriber.trial_proposals_used, 0) >= total_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Se chegou até aqui, está em trial válido
  RETURN TRUE;
END;
$$;
