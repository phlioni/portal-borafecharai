
-- Atualizar a função para criar novos usuários com role 'guest' por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Log para debug
  RAISE LOG 'Atribuindo role para novo usuário: %', NEW.id;
  
  -- Se é o admin principal, criar role admin
  IF NEW.email = 'admin@borafecharai.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE LOG 'Role admin atribuída para admin principal: %', NEW.id;
  ELSE
    -- Para outros usuários, criar role guest
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'guest')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE LOG 'Role guest atribuída para usuário: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia a criação do usuário
    RAISE LOG 'Erro ao atribuir role para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;
