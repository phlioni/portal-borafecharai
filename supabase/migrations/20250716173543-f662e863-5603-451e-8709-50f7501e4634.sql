
-- Atualizar todos os usuários com role 'user' que não têm assinatura ativa para terem trial de 15 dias
UPDATE public.subscribers 
SET 
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '15 days',
  trial_proposals_used = 0,
  subscribed = false,
  subscription_tier = null,
  updated_at = NOW()
WHERE user_id IN (
  SELECT ur.user_id 
  FROM public.user_roles ur
  WHERE ur.role = 'user'
) 
AND (subscribed = false OR subscribed IS NULL)
AND (subscription_tier IS NULL OR subscription_tier = '');

-- Garantir que usuários com role 'user' que não têm registro na tabela subscribers tenham um criado
INSERT INTO public.subscribers (
  user_id,
  email,
  trial_start_date,
  trial_end_date,
  trial_proposals_used,
  subscribed,
  subscription_tier,
  created_at,
  updated_at
)
SELECT 
  ur.user_id,
  au.email,
  NOW(),
  NOW() + INTERVAL '15 days',
  0,
  false,
  null,
  NOW(),
  NOW()
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
LEFT JOIN public.subscribers s ON s.user_id = ur.user_id
WHERE ur.role = 'user' 
AND s.user_id IS NULL;
