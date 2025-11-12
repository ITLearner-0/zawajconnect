-- Remove insecure RLS policy that allows unauthenticated inserts
DROP POLICY IF EXISTS "System can insert A/B test results" ON public.email_ab_test_results;

-- Create secure policy: Only service role can insert (edge functions only)
-- This prevents direct client inserts while allowing the backend to track emails
-- Note: Edge functions using SERVICE_ROLE_KEY bypass RLS, so this is for documentation
CREATE POLICY "Service role can manage A/B test results"
  ON public.email_ab_test_results
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can only view their own results (for analytics)
-- This policy already exists but confirming it's in place
DROP POLICY IF EXISTS "Users can view their own A/B test results" ON public.email_ab_test_results;
CREATE POLICY "Users can view their own A/B test results"
  ON public.email_ab_test_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all results (for analytics dashboard)
-- This policy already exists but confirming it's in place
DROP POLICY IF EXISTS "Admins can view A/B test results" ON public.email_ab_test_results;
CREATE POLICY "Admins can view A/B test results"
  ON public.email_ab_test_results
  FOR SELECT
  USING (is_admin(auth.uid()));
