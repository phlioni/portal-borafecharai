
-- Create whatsapp_sessions table for managing WhatsApp bot conversations
CREATE TABLE public.whatsapp_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  step TEXT NOT NULL DEFAULT 'start',
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage sessions (used by edge functions)
CREATE POLICY "Service role can manage whatsapp sessions" 
  ON public.whatsapp_sessions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add trigger to update updated_at column
CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON public.whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
