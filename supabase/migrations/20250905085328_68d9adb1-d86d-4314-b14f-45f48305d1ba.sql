-- Add policy to allow first super admin creation
-- This policy allows users to grant themselves super_admin role ONLY if no super_admin exists yet
CREATE POLICY "Allow first super admin creation"
ON public.user_roles
FOR INSERT
WITH CHECK (
  role = 'super_admin' AND
  NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  ) AND
  auth.uid() = user_id
);

-- Add policy to allow users to insert their own user role (default user role)
CREATE POLICY "Users can insert their own user role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  role = 'user' AND
  auth.uid() = user_id
);