-- Create admin user directly in the database
-- Email: admin@borafecharai.com
-- You'll need to set the password through Supabase Auth dashboard

-- Insert admin user role (this will be automatically assigned when you create the user)
-- The edge function create-admin-user can be used to create the admin user properly

-- For now, let's make sure our RLS policies allow admin access
UPDATE public.user_roles SET role = 'admin' WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@borafecharai.com' LIMIT 1
) AND EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@borafecharai.com'
);