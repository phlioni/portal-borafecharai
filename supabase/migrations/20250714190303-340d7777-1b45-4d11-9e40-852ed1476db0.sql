
-- Criar função para inicializar trial automaticamente para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger
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
    subscription_tier
  ) VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW() + INTERVAL '15 days',
    0,
    FALSE,
    NULL
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_trial();

-- Atualizar função can_create_proposal para ser mais rigorosa com a verificação de trial
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      -- Admin sempre pode criar
      WHEN public.has_role(_user_id, 'admin') THEN TRUE
      
      -- Se tem assinatura ativa
      WHEN (
        SELECT s.subscribed 
        FROM public.subscribers s 
        WHERE s.user_id = _user_id
      ) = TRUE THEN (
        CASE 
          WHEN (
            SELECT s.subscription_tier 
            FROM public.subscribers s 
            WHERE s.user_id = _user_id
          ) = 'basico' THEN (
            SELECT public.get_monthly_proposal_count(_user_id) < 10
          )
          ELSE TRUE -- professional tem propostas ilimitadas
        END
      )
      
      -- Verificação rigorosa do trial: deve ter trial_end_date >= now() E propostas < 20
      ELSE (
        SELECT 
          CASE 
            WHEN s.trial_end_date IS NULL THEN FALSE
            WHEN s.trial_end_date < now() THEN FALSE
            WHEN COALESCE(s.trial_proposals_used, 0) >= 20 THEN FALSE
            ELSE TRUE
          END
        FROM public.subscribers s 
        WHERE s.user_id = _user_id
      )
    END
$$;

-- Atualizar função para incrementar contagem de propostas do trial
CREATE OR REPLACE FUNCTION public.update_trial_proposal_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar contagem apenas se estiver em trial ativo
  UPDATE public.subscribers 
  SET 
    trial_proposals_used = COALESCE(trial_proposals_used, 0) + 1,
    updated_at = NOW()
  WHERE user_id = NEW.user_id 
    AND trial_end_date >= now()
    AND subscribed = FALSE;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger para incrementar contagem
DROP TRIGGER IF EXISTS update_trial_proposal_count_trigger ON public.proposals;
CREATE TRIGGER update_trial_proposal_count_trigger
  AFTER INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trial_proposal_count();
