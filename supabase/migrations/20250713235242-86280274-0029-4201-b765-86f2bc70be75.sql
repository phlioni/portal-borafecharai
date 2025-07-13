-- Definir admin@borafecharai.com com plano Equipe
INSERT INTO public.subscribers (
  email,
  user_id,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  trial_start_date,
  trial_end_date,
  trial_proposals_used,
  created_at,
  updated_at
) VALUES (
  'admin@borafecharai.com',
  (SELECT id FROM auth.users WHERE email = 'admin@borafecharai.com' LIMIT 1),
  NULL,
  true,
  'equipes',
  '2025-12-31 23:59:59'::timestamptz,
  NULL,
  NULL,
  NULL,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'equipes',
  subscription_end = '2025-12-31 23:59:59'::timestamptz,
  updated_at = now();