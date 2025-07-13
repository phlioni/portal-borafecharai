-- Atualizar função can_create_proposal para considerar limite de tempo e propostas
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
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
          ELSE TRUE -- profissional e equipes têm propostas ilimitadas
        END
      )
      
      -- Lógica do trial: verifica se ainda está no período E se não excedeu 20 propostas
      WHEN (
        SELECT s.trial_end_date 
        FROM public.subscribers s 
        WHERE s.user_id = _user_id
      ) >= now() THEN (
        -- Verifica se não excedeu o limite de 20 propostas no trial
        SELECT COALESCE(s.trial_proposals_used, 0) < 20
        FROM public.subscribers s 
        WHERE s.user_id = _user_id
      )
      
      ELSE FALSE -- Sem assinatura e sem trial ativo
    END
$function$;