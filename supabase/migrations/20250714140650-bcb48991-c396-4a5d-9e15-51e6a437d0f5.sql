
-- Adicionar coluna para logo da empresa
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url text;

-- Criar bucket para logos das empresas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de logos
CREATE POLICY "Users can upload their company logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualizar logos
CREATE POLICY "Anyone can view company logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');

-- Política para atualizar logos
CREATE POLICY "Users can update their company logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para deletar logos
CREATE POLICY "Users can delete their company logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar trigger para notificar mudanças de status nas propostas
CREATE OR REPLACE FUNCTION notify_proposal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar apenas quando o status mudar para 'aceita' ou 'rejeitada'
  IF NEW.status IN ('aceita', 'rejeitada') AND OLD.status != NEW.status THEN
    -- Inserir notificação (será processada pelo bot)
    INSERT INTO public.proposal_notifications (proposal_id, user_id, status, created_at)
    VALUES (NEW.id, NEW.user_id, NEW.status, NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela para notificações do Telegram
CREATE TABLE IF NOT EXISTS public.proposal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de notificações
ALTER TABLE public.proposal_notifications ENABLE ROW LEVEL SECURITY;

-- Política para visualizar apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications"
ON public.proposal_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Política para o sistema inserir notificações
CREATE POLICY "System can insert notifications"
ON public.proposal_notifications
FOR INSERT
WITH CHECK (true);

-- Política para marcar notificações como enviadas
CREATE POLICY "System can update notifications"
ON public.proposal_notifications
FOR UPDATE
USING (true);

-- Criar trigger para mudanças de status
DROP TRIGGER IF EXISTS proposal_status_change_trigger ON public.proposals;
CREATE TRIGGER proposal_status_change_trigger
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION notify_proposal_status_change();
