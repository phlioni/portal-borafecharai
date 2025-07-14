
-- Adicionar coluna chat_id na tabela telegram_bot_settings
ALTER TABLE public.telegram_bot_settings 
ADD COLUMN chat_id BIGINT;

-- Criar índice para melhor performance
CREATE INDEX idx_telegram_bot_settings_chat_id 
ON public.telegram_bot_settings(chat_id);

-- Adicionar constraint de unicidade para o chat_id
ALTER TABLE public.telegram_bot_settings 
ADD CONSTRAINT unique_chat_id UNIQUE(chat_id);

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.telegram_bot_settings.chat_id IS 'ID do chat do Telegram para envio de notificações';
