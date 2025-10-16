-- Consolidate multiple overlapping SELECT policies on islamic_guidance
-- This improves performance by reducing policy evaluation overhead

-- Create helper function for checking premium user status
CREATE OR REPLACE FUNCTION public.is_premium_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.user_id = (SELECT auth.uid())
      AND s.status = 'active'
      AND s.plan_type IN ('premium', 'family')
      AND (s.expires_at IS NULL OR s.expires_at > now())
  );
$$;

-- Revoke direct execution from roles
REVOKE EXECUTE ON FUNCTION public.is_premium_user() FROM anon, authenticated;

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Authenticated users can read published guidance" ON public.islamic_guidance;
DROP POLICY IF EXISTS "Premium users can access all guidance" ON public.islamic_guidance;

-- Create consolidated SELECT policy
-- Published guidance is accessible to all authenticated users
-- All guidance (including unpublished) is accessible to premium users
CREATE POLICY "Consolidated guidance viewing access"
ON public.islamic_guidance
FOR SELECT
TO authenticated
USING (
  published = true
  OR is_premium_user()
);

-- Create supporting indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_islamic_guidance_published ON public.islamic_guidance(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_active_premium ON public.subscriptions(user_id, status, plan_type, expires_at) 
  WHERE status = 'active' AND plan_type IN ('premium', 'family');