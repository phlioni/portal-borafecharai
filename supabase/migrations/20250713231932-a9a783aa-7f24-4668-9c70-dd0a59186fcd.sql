-- Atualizar diretamente o admin para o plano Equipes
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'equipes',
  subscription_end = '2025-12-31 23:59:59+00',
  updated_at = now()
WHERE email = 'admin@borafecharai.com';