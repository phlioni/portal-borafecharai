
-- Criar tabela para disponibilidade de horários do usuário
CREATE TABLE IF NOT EXISTS public.service_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para service_availability
CREATE POLICY "Users can manage their own availability" ON public.service_availability
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Adicionar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_availability_updated_at 
  BEFORE UPDATE ON public.service_availability 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Criar tabela para ordens de serviço/agendamentos
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
  client_notes TEXT,
  provider_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para service_orders
CREATE POLICY "Users can view their own service orders" ON public.service_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service orders" ON public.service_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service orders" ON public.service_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service orders" ON public.service_orders
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir que clientes criem agendamentos via proposta pública
CREATE POLICY "Public can create service orders via proposal" ON public.service_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND public_hash IS NOT NULL
    )
  );

-- Adicionar trigger para updated_at
CREATE TRIGGER update_service_orders_updated_at 
  BEFORE UPDATE ON public.service_orders 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
