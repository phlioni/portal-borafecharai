-- Iniciar trial para o usuário atual
UPDATE subscribers 
SET 
  trial_start_date = now(),
  trial_end_date = now() + interval '15 days',
  trial_proposals_used = 0
WHERE user_id = 'aec1d27c-5ea3-4ae0-b143-940328cb75b4' 
  AND trial_start_date IS NULL;