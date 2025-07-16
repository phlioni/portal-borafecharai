
-- Adicionar colunas business_segment e business_type_detail à tabela companies se não existirem
DO $$ 
BEGIN
    -- Adicionar business_segment se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' 
                   AND column_name = 'business_segment' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.companies ADD COLUMN business_segment TEXT;
    END IF;

    -- Adicionar business_type_detail se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' 
                   AND column_name = 'business_type_detail' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.companies ADD COLUMN business_type_detail TEXT;
    END IF;
END $$;
