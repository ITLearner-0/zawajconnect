-- Fix the existing policy conflict by dropping existing policies first
-- Then recreate with enhanced security

-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage moderator and user roles only" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Recreate policies with proper constraints
CREATE POLICY "Super admins can manage all roles" ON user_roles
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage moderator and user roles only" ON user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role IN ('moderator'::app_role, 'user'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role IN ('moderator'::app_role, 'user'::app_role)
);

CREATE POLICY "Users can view their own role" ON user_roles
FOR SELECT
USING (auth.uid() = user_id);