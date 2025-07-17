
-- Criar função para atribuir role 'user' automaticamente para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'Atribuindo role user para novo usuário: %', NEW.id;
  
  -- Inserir role 'user' automaticamente para todo novo usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE LOG 'Role user atribuída com sucesso para usuário: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia a criação do usuário
    RAISE LOG 'Erro ao atribuir role para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
