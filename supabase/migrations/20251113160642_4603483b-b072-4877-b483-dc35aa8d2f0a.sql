-- Fix critical security issue: Restrict email_ab_tests table access to admins only
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Email AB tests are viewable by everyone" ON public.email_ab_tests;

-- Create admin-only access policy
CREATE POLICY "Only admins can view email AB tests"
ON public.email_ab_tests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Only admins can manage email AB tests"
ON public.email_ab_tests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Optionally restrict daily_quests to authenticated users only
-- Drop existing public policy
DROP POLICY IF EXISTS "Daily quests are viewable by everyone" ON public.daily_quests;

-- Create authenticated-only policy
CREATE POLICY "Authenticated users can view daily quests"
ON public.daily_quests
FOR SELECT
TO authenticated
USING (true);

-- Fix function search_path warnings by setting search_path on security definer functions
-- Update existing functions to have proper search_path set
ALTER FUNCTION public.check_family_access_rate_limit SET search_path = public;
ALTER FUNCTION public.get_user_verification_status_secure SET search_path = public;