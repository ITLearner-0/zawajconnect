-- Fix function search path security warnings
-- Set search_path for functions that don't have it configured

ALTER FUNCTION public.check_family_operation_rate_limit() SET search_path = public;
ALTER FUNCTION public.log_security_event() SET search_path = public;