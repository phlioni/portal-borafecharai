-- Adicionar campos para trial gratuito na tabela subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_proposals_used INTEGER DEFAULT 0;

-- Atualizar função can_create_proposal para incluir trial
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(_user_id, 'admin') THEN TRUE
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
          ELSE TRUE -- profissional and equipes have unlimited proposals
        END
      )
      -- Trial period logic
      WHEN (
        SELECT s.trial_end_date 
        FROM public.subscribers s 
        WHERE s.user_id = _user_id
      ) >= now() THEN (
        SELECT COALESCE(s.trial_proposals_used, 0) < 20
        FROM public.subscribers s 
        WHERE s.user_id = _user_id
      )
      ELSE FALSE
    END
$$;