
-- Adicionar as colunas business_segment e business_type_detail à tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS business_segment TEXT,
ADD COLUMN IF NOT EXISTS business_type_detail TEXT;
