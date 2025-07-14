-- Resetar o trial do admin@borafecharai.com
UPDATE public.subscribers 
SET 
  trial_start_date = now(),
  trial_end_date = now() + interval '15 days',
  trial_proposals_used = 0,
  subscribed = true,
  subscription_tier = 'equipes'
WHERE email = 'admin@borafecharai.com';