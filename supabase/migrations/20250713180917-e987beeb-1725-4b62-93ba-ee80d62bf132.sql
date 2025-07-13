-- Inserir role admin para o usuário admin@borafecharai.com
INSERT INTO public.user_roles (user_id, role) 
VALUES (
  'ff0a38a8-2f77-488c-93cd-7de57ca4425b',
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;