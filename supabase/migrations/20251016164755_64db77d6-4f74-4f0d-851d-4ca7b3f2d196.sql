-- Consolidate duplicate permissive SELECT policies on user_status
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Admins can manage all user status" ON public.user_status;
DROP POLICY IF EXISTS "Users can view their own status" ON public.user_status;

-- Create a single consolidated SELECT policy that combines both conditions
CREATE POLICY "Consolidated user status access"
ON public.user_status
FOR SELECT
TO authenticated
USING (
  -- Admins can view all user statuses
  is_admin(auth.uid())
  OR
  -- Users can view their own status
  (auth.uid() = user_id)
);

-- Add index to improve policy evaluation performance
CREATE INDEX IF NOT EXISTS idx_user_status_user_id 
ON public.user_status(user_id);