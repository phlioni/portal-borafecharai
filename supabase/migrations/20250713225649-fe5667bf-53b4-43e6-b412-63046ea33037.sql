-- Add cancel_at_period_end column to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;