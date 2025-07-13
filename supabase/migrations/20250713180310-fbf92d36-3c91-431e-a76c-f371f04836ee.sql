-- Atualizar admin para o plano mais completo (equipes)
INSERT INTO public.subscribers (
  email,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  updated_at
) VALUES (
  'admin@borafecharai.com',
  (SELECT id FROM auth.users WHERE email = 'admin@borafecharai.com' LIMIT 1),
  true,
  'equipes',
  '2025-12-31 23:59:59+00',
  now()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'equipes',
  subscription_end = '2025-12-31 23:59:59+00',
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@borafecharai.com'
);