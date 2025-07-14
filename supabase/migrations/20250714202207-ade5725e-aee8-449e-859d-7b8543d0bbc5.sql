
-- Criar tabela para armazenar sessões do bot Telegram
CREATE TABLE public.telegram_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  step TEXT NOT NULL DEFAULT 'start',
  session_data JSONB DEFAULT '{}',
  phone TEXT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  UNIQUE(telegram_user_id)
);

-- Habilitar RLS na tabela
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso via service role (para Edge Functions)
CREATE POLICY "Service role can manage telegram sessions" 
  ON public.telegram_sessions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX idx_telegram_sessions_telegram_user_id 
ON public.telegram_sessions(telegram_user_id);

CREATE INDEX idx_telegram_sessions_chat_id 
ON public.telegram_sessions(chat_id);

CREATE INDEX idx_telegram_sessions_expires_at 
ON public.telegram_sessions(expires_at);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_telegram_sessions_updated_at 
  BEFORE UPDATE ON public.telegram_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar sessões expiradas (pode ser chamada periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_telegram_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.telegram_sessions 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Comentários explicativos
COMMENT ON TABLE public.telegram_sessions IS 'Armazena o estado das sessões do bot Telegram para persistência entre requisições';
COMMENT ON COLUMN public.telegram_sessions.telegram_user_id IS 'ID do usuário no Telegram';
COMMENT ON COLUMN public.telegram_sessions.chat_id IS 'ID do chat no Telegram';
COMMENT ON COLUMN public.telegram_sessions.step IS 'Etapa atual da conversa';
COMMENT ON COLUMN public.telegram_sessions.session_data IS 'Dados da sessão em formato JSON';
COMMENT ON COLUMN public.telegram_sessions.phone IS 'Telefone compartilhado pelo usuário';
COMMENT ON COLUMN public.telegram_sessions.user_id IS 'ID do usuário autenticado no sistema';
COMMENT ON COLUMN public.telegram_sessions.expires_at IS 'Data de expiração da sessão';
