-- Permitir atualização de status das propostas via public_hash (para aceitar/rejeitar)
CREATE POLICY "Public update proposal status via public_hash" 
ON public.proposals 
FOR UPDATE 
USING (public_hash IS NOT NULL)
WITH CHECK (public_hash IS NOT NULL AND status IN ('aceita', 'rejeitada', 'enviada'));