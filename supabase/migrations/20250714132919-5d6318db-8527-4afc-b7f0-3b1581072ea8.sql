
-- Criar tabela para configurações do bot do Telegram
CREATE TABLE public.telegram_bot_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  bot_token text,
  bot_username text,
  webhook_configured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.telegram_bot_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own bot settings" 
  ON public.telegram_bot_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot settings" 
  ON public.telegram_bot_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot settings" 
  ON public.telegram_bot_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot settings" 
  ON public.telegram_bot_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar tabela para templates personalizados
CREATE TABLE public.custom_proposal_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  template_id text NOT NULL,
  description text,
  html_content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Habilitar RLS
ALTER TABLE public.custom_proposal_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own templates" 
  ON public.custom_proposal_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" 
  ON public.custom_proposal_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
  ON public.custom_proposal_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
  ON public.custom_proposal_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_telegram_bot_settings_updated_at 
  BEFORE UPDATE ON public.telegram_bot_settings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_custom_proposal_templates_updated_at 
  BEFORE UPDATE ON public.custom_proposal_templates 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
