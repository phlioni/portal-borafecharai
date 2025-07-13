-- Adicionar coluna para hash público nas propostas
ALTER TABLE public.proposals 
ADD COLUMN public_hash TEXT UNIQUE;

-- Função para gerar hash único para propostas
CREATE OR REPLACE FUNCTION generate_proposal_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.public_hash = encode(digest(concat(NEW.id::text, extract(epoch from now())::text, random()::text), 'sha256'), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar hash automaticamente
CREATE TRIGGER generate_proposal_hash_trigger
BEFORE INSERT ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION generate_proposal_hash();

-- Atualizar propostas existentes com hash
UPDATE public.proposals 
SET public_hash = encode(digest(concat(id::text, extract(epoch from created_at)::text, random()::text), 'sha256'), 'hex')
WHERE public_hash IS NULL;