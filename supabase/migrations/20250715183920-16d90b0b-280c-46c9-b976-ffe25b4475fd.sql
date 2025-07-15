
-- Verificar se a tabela companies tem todos os campos necessários
-- e adicionar campos que possam estar faltando para a funcionalidade completa

-- Verificar estrutura atual da tabela companies
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'companies' AND table_schema = 'public';

-- Garantir que todos os campos necessários existem na tabela companies
-- (alguns podem já existir conforme a migração anterior)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS legal_name TEXT;

-- Atualizar a função de busca de empresas se necessário
-- Criar índice para melhor performance nas consultas por user_id
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);

-- Garantir que a política RLS está correta para buscar dados da empresa
-- (as políticas já devem existir, mas vamos verificar)
