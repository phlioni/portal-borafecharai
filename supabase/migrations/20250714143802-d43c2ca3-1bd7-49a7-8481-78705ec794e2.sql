
-- Adicionar constraint de unicidade para o telefone
ALTER TABLE public.companies 
ADD CONSTRAINT unique_phone_per_user UNIQUE (phone, user_id);

-- Adicionar índice para busca rápida por telefone
CREATE INDEX IF NOT EXISTS idx_companies_phone ON public.companies(phone) WHERE phone IS NOT NULL;

-- Criar função para verificar se telefone já existe para outro usuário
CREATE OR REPLACE FUNCTION check_unique_phone_across_users(p_phone text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Retorna true se o telefone não existe ou pertence ao mesmo usuário
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.companies 
    WHERE phone = p_phone 
    AND user_id != p_user_id
    AND phone IS NOT NULL
    AND phone != ''
  );
END;
$$;

-- Criar função para admin resetar dados de usuário
CREATE OR REPLACE FUNCTION admin_reset_user_data(
  target_user_id uuid,
  reset_proposals boolean DEFAULT false,
  reset_trial boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  -- Resetar propostas se solicitado
  IF reset_proposals THEN
    UPDATE public.subscribers 
    SET trial_proposals_used = 0
    WHERE user_id = target_user_id;
  END IF;

  -- Resetar trial se solicitado
  IF reset_trial THEN
    UPDATE public.subscribers 
    SET 
      trial_start_date = NOW(),
      trial_end_date = NOW() + INTERVAL '30 days',
      trial_proposals_used = 0
    WHERE user_id = target_user_id;
  END IF;

  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'message', 'User data reset successfully'
  ) INTO result;

  RETURN result;
END;
$$;

-- Criar função para admin gerenciar status de usuário
CREATE OR REPLACE FUNCTION admin_manage_user_status(
  target_user_id uuid,
  action text, -- 'activate', 'deactivate', 'delete'
  make_admin boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  -- Gerenciar permissão de admin
  IF make_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'admin';
  END IF;

  -- Processar ação
  CASE action
    WHEN 'activate' THEN
      UPDATE public.subscribers 
      SET subscribed = true
      WHERE user_id = target_user_id;
      
    WHEN 'deactivate' THEN
      UPDATE public.subscribers 
      SET subscribed = false
      WHERE user_id = target_user_id;
      
    WHEN 'delete' THEN
      -- Deletar dados relacionados
      DELETE FROM public.proposals WHERE user_id = target_user_id;
      DELETE FROM public.companies WHERE user_id = target_user_id;
      DELETE FROM public.subscribers WHERE user_id = target_user_id;
      DELETE FROM public.user_roles WHERE user_id = target_user_id;
      -- Nota: O usuário da tabela auth deve ser deletado via edge function
      
    ELSE
      RAISE EXCEPTION 'Invalid action: %', action;
  END CASE;

  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'message', format('User %s successfully', action)
  ) INTO result;

  RETURN result;
END;
$$;
