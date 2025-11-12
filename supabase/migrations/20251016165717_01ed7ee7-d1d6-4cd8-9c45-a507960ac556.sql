-- Consolidate multiple overlapping SELECT policies on user_roles
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Admins can view admin and below roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create a single consolidated SELECT policy that combines all conditions
CREATE POLICY "Consolidated role viewing access"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  -- Super admins can view all roles
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  -- Admins can view admin, moderator, and user roles (but not super_admin)
  (
    has_role(auth.uid(), 'admin'::app_role)
    AND role = ANY(ARRAY['admin'::app_role, 'moderator'::app_role, 'user'::app_role])
  )
  OR
  -- Users can view their own role
  (user_id = auth.uid())
);

-- Indexes already created in previous migration:
-- idx_user_roles_role and idx_user_roles_user_id