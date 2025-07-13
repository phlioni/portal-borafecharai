-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add column to track monthly proposal count
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS created_month DATE GENERATED ALWAYS AS (DATE_TRUNC('month', created_at)::DATE) STORED;

-- Create index for better performance on monthly queries
CREATE INDEX IF NOT EXISTS idx_proposals_user_month ON public.proposals(user_id, created_month);

-- Function to get user's monthly proposal count
CREATE OR REPLACE FUNCTION public.get_monthly_proposal_count(_user_id UUID, _month DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.proposals
  WHERE user_id = _user_id
    AND created_month = DATE_TRUNC('month', _month)::DATE
$$;

-- Function to check if user can create proposal based on their plan
CREATE OR REPLACE FUNCTION public.can_create_proposal(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(_user_id, 'admin') THEN TRUE
      WHEN (
        SELECT s.subscription_tier 
        FROM public.subscribers s 
        WHERE s.user_id = _user_id AND s.subscribed = TRUE
      ) = 'basico' THEN (
        SELECT public.get_monthly_proposal_count(_user_id) < 10
      )
      ELSE TRUE -- profissional and equipes have unlimited proposals
    END
$$;