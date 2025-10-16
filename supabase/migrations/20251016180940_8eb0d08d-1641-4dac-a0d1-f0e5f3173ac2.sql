-- Consolidate multiple overlapping UPDATE policies on islamic_moderation_rules
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant UPDATE policies
DROP POLICY IF EXISTS "Admin only moderation rules access" ON public.islamic_moderation_rules;
DROP POLICY IF EXISTS "Admins can manage moderation rules" ON public.islamic_moderation_rules;

-- Create consolidated UPDATE policy
-- Only admins can update moderation rules
CREATE POLICY "Consolidated moderation rules update access"
ON public.islamic_moderation_rules
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
);

-- Ensure we have proper policies for other operations
-- Drop old ALL policy if it exists
DROP POLICY IF EXISTS "Admin only moderation rules access" ON public.islamic_moderation_rules;

-- Create consolidated SELECT policy for viewing rules
CREATE POLICY "Admins can view moderation rules"
ON public.islamic_moderation_rules
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
);

-- Create consolidated INSERT policy
CREATE POLICY "Admins can create moderation rules"
ON public.islamic_moderation_rules
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
);

-- Create consolidated DELETE policy
CREATE POLICY "Admins can delete moderation rules"
ON public.islamic_moderation_rules
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid())
);

-- Supporting indexes already exist on user_roles from previous migrations
-- idx_user_roles_role and idx_user_roles_user_id