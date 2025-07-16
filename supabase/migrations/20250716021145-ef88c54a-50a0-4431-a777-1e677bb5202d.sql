
-- Adicionar coluna para armazenar o email do cliente nas sessões do Telegram
ALTER TABLE telegram_sessions 
ADD COLUMN client_email TEXT;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_user_id ON telegram_sessions(user_id);
