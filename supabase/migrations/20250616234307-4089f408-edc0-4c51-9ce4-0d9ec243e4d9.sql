
-- Fix the security vulnerability by setting a fixed search_path for notify_new_compatibility_result function
CREATE OR REPLACE FUNCTION public.notify_new_compatibility_result()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- This will be used by our realtime subscription
  RETURN NEW;
END;
$function$;
