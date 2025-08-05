
-- 1. CREATE WORK_ORDERS TABLE
-- This table stores all information about customer-made service appointments.
CREATE TABLE public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    client_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval', -- Possible statuses: pending_approval, approved, rescheduled, completed, canceled
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Realtime for the table to allow live updates on the frontend
ALTER TABLE public.work_orders REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;

-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- Essential to ensure users can only access their own data.
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for own work orders"
ON public.work_orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users"
ON public.work_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for own work orders"
ON public.work_orders FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_work_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_orders_updated_at
    BEFORE UPDATE ON public.work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_work_orders_updated_at();
