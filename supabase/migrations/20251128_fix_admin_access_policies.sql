-- Fix admin access policies - resolve circular dependency and duplicate policies
-- This migration fixes the issue where admins cannot access the admin dashboard

-- Drop all existing SELECT policies on user_roles to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view admin and below roles" ON public.user_roles;

-- Drop the problematic "FOR ALL" policies that include SELECT
-- We'll recreate them more specifically to avoid circular dependencies
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage moderator and user roles only" ON public.user_roles;

-- CREATE SELECT POLICIES FIRST (these don't have circular dependencies)
-- Policy 1: ALL authenticated users can view their own role
-- This is critical and must work for everyone, including admins checking their own role
CREATE POLICY "users_select_own_role" ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users with admin or super_admin role can view all roles
-- This works because the user can already see their own role from Policy 1
CREATE POLICY "admins_select_all_roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin'::app_role, 'super_admin'::app_role)
  )
);

-- CREATE INSERT/UPDATE/DELETE POLICIES (management policies)
-- Policy 3: Super admins can manage (insert/update/delete) all roles
CREATE POLICY "super_admins_manage_all_roles" ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Policy 4: Regular admins can only manage moderator and user roles (not admin or super_admin)
CREATE POLICY "admins_manage_limited_roles" ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role IN ('moderator'::app_role, 'user'::app_role)
);

CREATE POLICY "admins_update_limited_roles" ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role IN ('moderator'::app_role, 'user'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role IN ('moderator'::app_role, 'user'::app_role)
);

CREATE POLICY "admins_delete_limited_roles" ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role IN ('moderator'::app_role, 'user'::app_role)
);

-- Policy 5: Allow bootstrap - first super_admin creation
-- Keep the consolidated INSERT policy from migration 20251016170321
-- But make sure it doesn't conflict
DROP POLICY IF EXISTS "Consolidated role insertion access" ON public.user_roles;

CREATE POLICY "bootstrap_and_user_role_insertion" ON public.user_roles
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
  OR
  -- Admins can insert moderator and user roles (covered by admin policy)
  (
    has_role(auth.uid(), 'admin'::app_role)
    AND role IN ('moderator'::app_role, 'user'::app_role)
  )
  OR
  -- Super admins can insert any role (covered by super admin policy)
  (
    has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- Add helpful comment
COMMENT ON POLICY "users_select_own_role" ON public.user_roles IS
'Critical policy: All users must be able to view their own role without circular dependencies';

COMMENT ON POLICY "admins_select_all_roles" ON public.user_roles IS
'Admins and super admins can view all user roles';
