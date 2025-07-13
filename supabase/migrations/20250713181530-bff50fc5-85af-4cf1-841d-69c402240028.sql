-- Criar função para atualizar contagem de propostas do trial
CREATE OR REPLACE FUNCTION public.update_trial_proposal_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar contagem de propostas do trial se o usuário estiver no período de teste
  UPDATE public.subscribers 
  SET trial_proposals_used = COALESCE(trial_proposals_used, 0) + 1
  WHERE user_id = NEW.user_id 
    AND trial_end_date >= now()
    AND NOT subscribed;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para propostas
CREATE OR REPLACE TRIGGER update_trial_count_on_proposal_insert
AFTER INSERT ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_trial_proposal_count();