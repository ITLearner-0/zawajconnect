-- Consolidate multiple overlapping SELECT policies on subscriptions
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Super admins can access payment data" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription with enhanced verification" ON public.subscriptions;

-- Create a single consolidated SELECT policy that combines all conditions
CREATE POLICY "Consolidated subscription viewing access"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  -- Super admins can view all subscriptions
  is_admin(auth.uid())
  OR
  -- Users can view their own subscription
  (user_id = auth.uid())
);

-- Create supporting indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);