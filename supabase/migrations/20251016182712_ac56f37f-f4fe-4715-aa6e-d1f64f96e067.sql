-- Consolidate multiple overlapping policies on admin_settings
-- This improves performance by reducing policy evaluation overhead

-- Drop all existing policies on admin_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can access admin settings" ON public.admin_settings;

-- Create separate policies for each operation
-- All operations are admin-only

CREATE POLICY "Admins can view settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
);

CREATE POLICY "Admins can create settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
);

CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
);

CREATE POLICY "Admins can delete settings"
ON public.admin_settings
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid())
);

-- Supporting indexes already exist from previous migrations
-- idx_user_roles_role and idx_user_roles_user_id