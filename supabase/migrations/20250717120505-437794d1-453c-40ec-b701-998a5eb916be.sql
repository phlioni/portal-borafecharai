
-- Criar tabela para a empresa do usuário
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  cnpj TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  country_code TEXT DEFAULT '+55',
  business_segment TEXT,
  business_type_detail TEXT,
  business_type TEXT,
  legal_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrar dados da tabela companies para user_companies (primeira empresa de cada usuário)
INSERT INTO public.user_companies (
  id, user_id, name, email, phone, address, city, state, zip_code, cnpj, 
  website, description, logo_url, country_code, business_segment, 
  business_type_detail, business_type, legal_name, created_at, updated_at
)
SELECT DISTINCT ON (user_id)
  id, user_id, name, email, phone, address, city, state, zip_code, cnpj,
  website, description, logo_url, country_code, business_segment,
  business_type_detail, business_type, legal_name, created_at, updated_at
FROM public.companies
ORDER BY user_id, created_at ASC;

-- Migrar dados restantes da tabela companies para clients
INSERT INTO public.clients (id, user_id, name, email, phone, created_at, updated_at)
SELECT id, user_id, name, email, phone, created_at, updated_at
FROM public.companies
WHERE id NOT IN (SELECT id FROM public.user_companies);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_companies
CREATE POLICY "Users can view their own company" 
  ON public.user_companies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company" 
  ON public.user_companies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" 
  ON public.user_companies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company" 
  ON public.user_companies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para clients
CREATE POLICY "Users can view their own clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_user_companies_updated_at BEFORE UPDATE ON public.user_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar referências na tabela proposals para apontar para clients
ALTER TABLE public.proposals 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Migrar company_id para client_id na tabela proposals
UPDATE public.proposals 
SET client_id = company_id 
WHERE company_id IS NOT NULL 
AND company_id NOT IN (SELECT id FROM public.user_companies);

-- Remover a coluna company_id da tabela proposals (após migração)
ALTER TABLE public.proposals DROP COLUMN company_id;
