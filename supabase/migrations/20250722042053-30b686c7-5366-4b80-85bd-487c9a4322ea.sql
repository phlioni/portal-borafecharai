
-- Create service_availability table for scheduling configuration
CREATE TABLE IF NOT EXISTS public.service_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Create service_orders table for Order of Service
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'reagendado', 'finalizado', 'cancelado')),
  client_notes TEXT,
  provider_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_availability
CREATE POLICY "Users can manage their own availability" ON public.service_availability
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for service_orders
CREATE POLICY "Users can view their own service orders" ON public.service_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service orders" ON public.service_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service orders" ON public.service_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service orders" ON public.service_orders
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can create service orders via proposal" ON public.service_orders
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE id = service_orders.proposal_id 
    AND public_hash IS NOT NULL
  ));

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_availability_updated_at 
  BEFORE UPDATE ON public.service_availability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at 
  BEFORE UPDATE ON public.service_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
