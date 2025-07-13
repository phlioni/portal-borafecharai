
-- Criar tabela de empresas/clientes
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de propostas
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES public.companies,
  title TEXT NOT NULL,
  service_description TEXT,
  detailed_description TEXT,
  value DECIMAL(12,2),
  delivery_time TEXT,
  validity_date DATE,
  observations TEXT,
  template_id TEXT DEFAULT 'moderno',
  status TEXT DEFAULT 'enviada' CHECK (status IN ('enviada', 'visualizada', 'aceita', 'perdida')),
  views INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para companies
CREATE POLICY "Users can view their own companies" 
  ON public.companies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies" 
  ON public.companies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies" 
  ON public.companies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para proposals
CREATE POLICY "Users can view their own proposals" 
  ON public.proposals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proposals" 
  ON public.proposals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals" 
  ON public.proposals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals" 
  ON public.proposals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
