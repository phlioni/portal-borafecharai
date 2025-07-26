
-- Criar tabela para disponibilidade de horários do prestador
CREATE TABLE public.service_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = domingo, 1 = segunda, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para ordens de serviço
CREATE TABLE public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- prestador de serviço
  proposal_id UUID NOT NULL,
  client_id UUID,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado', -- agendado, confirmado, reagendamento_solicitado, concluido, cancelado
  client_notes TEXT,
  provider_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar RLS para service_availability
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own availability" 
  ON public.service_availability 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Adicionar RLS para service_orders
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own service orders" 
  ON public.service_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service orders" 
  ON public.service_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service orders" 
  ON public.service_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service orders" 
  ON public.service_orders 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can create service orders via proposal" 
  ON public.service_orders 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = service_orders.proposal_id 
      AND public_hash IS NOT NULL
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_business_tables()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_availability_updated_at
    BEFORE UPDATE ON public.service_availability
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_business_tables();

CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON public.service_orders
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_business_tables();
