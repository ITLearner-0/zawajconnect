-- Consolidate multiple overlapping UPDATE policies on user_roles
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant UPDATE policies
DROP POLICY IF EXISTS "Admins can manage moderator and user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage moderator and user roles only" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create a single consolidated UPDATE policy that combines all conditions
CREATE POLICY "Consolidated role management update"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  -- Super admins can update all roles
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  -- Admins can update only moderator and user roles
  (
    has_role(auth.uid(), 'admin'::app_role)
    AND role = ANY(ARRAY['moderator'::app_role, 'user'::app_role])
  )
)
WITH CHECK (
  -- Super admins can set any role
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  -- Admins can only set moderator and user roles
  (
    has_role(auth.uid(), 'admin'::app_role)
    AND role = ANY(ARRAY['moderator'::app_role, 'user'::app_role])
  )
);

-- Add indexes to improve policy evaluation performance
CREATE INDEX IF NOT EXISTS idx_user_roles_role 
ON public.user_roles(role);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles(user_id);