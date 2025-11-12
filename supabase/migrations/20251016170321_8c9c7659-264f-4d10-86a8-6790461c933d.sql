-- Consolidate multiple overlapping INSERT policies on user_roles
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant INSERT policies
DROP POLICY IF EXISTS "Allow first super admin creation" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own user role" ON public.user_roles;

-- Create a single consolidated INSERT policy that combines all conditions
CREATE POLICY "Consolidated role insertion access"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Regular users can insert their own user role
  (user_id = auth.uid() AND role = 'user'::app_role)
  OR
  -- Allow first super admin creation (bootstrap scenario)
  (
    role = 'super_admin'::app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.role = 'super_admin'::app_role
    )
  )
);

-- Indexes already created in previous migration:
-- idx_user_roles_user_id and idx_user_roles_role