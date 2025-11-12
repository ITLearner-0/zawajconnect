-- Fix missing search_path on SECURITY DEFINER cron functions
-- This prevents potential security vulnerabilities from search_path hijacking

-- Fix check_unread_messages_and_notify
ALTER FUNCTION public.check_unread_messages_and_notify()
  SET search_path = public, pg_temp;

-- Fix check_subscription_expiry_and_notify
ALTER FUNCTION public.check_subscription_expiry_and_notify()
  SET search_path = public, pg_temp;

-- Fix check_incomplete_profiles_and_notify
ALTER FUNCTION public.check_incomplete_profiles_and_notify()
  SET search_path = public, pg_temp;

-- Fix send_match_suggestions_batch
ALTER FUNCTION public.send_match_suggestions_batch()
  SET search_path = public, pg_temp;

-- Fix send_monthly_newsletter
ALTER FUNCTION public.send_monthly_newsletter()
  SET search_path = public, pg_temp;

-- Fix send_weekly_tips_batch
ALTER FUNCTION public.send_weekly_tips_batch()
  SET search_path = public, pg_temp;

-- Revoke public execution and grant only to authenticated users
REVOKE ALL ON FUNCTION public.check_unread_messages_and_notify() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_subscription_expiry_and_notify() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_incomplete_profiles_and_notify() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.send_match_suggestions_batch() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.send_monthly_newsletter() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.send_weekly_tips_batch() FROM PUBLIC;