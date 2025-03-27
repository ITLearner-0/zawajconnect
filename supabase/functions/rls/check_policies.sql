
-- Function to check if RLS policies are properly set up
CREATE OR REPLACE FUNCTION public.check_rls_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rls_enabled_count integer;
  expected_tables integer := 14; -- Updated count with spatial_ref_sys
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables t
  JOIN pg_class c ON t.tablename = c.relname
  WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true
  AND t.tablename IN (
    'profiles', 'conversations', 'messages', 'compatibility_results',
    'compatibility_scores', 'content_flags', 'content_reports',
    'monitoring_reports', 'wali_profiles', 'chat_requests',
    'supervision_sessions', 'video_calls', 'user_sessions', 'spatial_ref_sys'
  );
  
  -- Check if all expected tables have RLS enabled
  RETURN rls_enabled_count = expected_tables;
END;
$$;
