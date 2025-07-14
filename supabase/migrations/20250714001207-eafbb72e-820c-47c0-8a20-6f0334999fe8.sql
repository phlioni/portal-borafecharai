-- Criar política para permitir acesso público às propostas via public_hash
CREATE POLICY "Public access to proposals via public_hash" 
ON public.proposals 
FOR SELECT 
USING (public_hash IS NOT NULL);