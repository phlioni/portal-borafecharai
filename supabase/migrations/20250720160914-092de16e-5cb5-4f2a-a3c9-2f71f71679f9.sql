
-- Criar tabela para controlar sequência de propostas por ano
CREATE TABLE IF NOT EXISTS public.proposal_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  next_sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo proposal_number na tabela proposals
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS proposal_number TEXT;

-- Criar função para gerar próximo número de proposta
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year INTEGER;
  sequence_number INTEGER;
  proposal_id TEXT;
BEGIN
  -- Obter ano atual
  current_year := EXTRACT(YEAR FROM NOW());
  
  -- Inserir ou atualizar sequência para o ano atual
  INSERT INTO public.proposal_sequences (year, next_sequence)
  VALUES (current_year, 2)
  ON CONFLICT (year) 
  DO UPDATE SET 
    next_sequence = proposal_sequences.next_sequence + 1,
    updated_at = NOW()
  RETURNING next_sequence - 1 INTO sequence_number;
  
  -- Gerar ID no formato PROP0001-2025
  proposal_id := 'PROP' || LPAD(sequence_number::TEXT, 4, '0') || '-' || current_year::TEXT;
  
  RETURN proposal_id;
END;
$$;

-- Criar trigger para gerar proposal_number automaticamente
CREATE OR REPLACE FUNCTION public.set_proposal_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := public.generate_proposal_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela proposals
DROP TRIGGER IF EXISTS trigger_set_proposal_number ON public.proposals;
CREATE TRIGGER trigger_set_proposal_number
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_number();

-- Habilitar RLS na tabela proposal_sequences
ALTER TABLE public.proposal_sequences ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura da sequência (necessária para a função)
CREATE POLICY "Allow read proposal sequences" ON public.proposal_sequences
  FOR SELECT USING (true);

-- Política para permitir inserção/atualização da sequência (necessária para a função)
CREATE POLICY "Allow insert/update proposal sequences" ON public.proposal_sequences
  FOR ALL USING (true);
