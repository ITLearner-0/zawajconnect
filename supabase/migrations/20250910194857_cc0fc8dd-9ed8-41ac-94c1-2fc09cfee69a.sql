-- Fix the handle_new_user_settings function to prevent duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create verification record with UPSERT
  INSERT INTO public.user_verifications (user_id, email_verified)
  VALUES (NEW.user_id, true)
  ON CONFLICT (user_id) DO UPDATE SET
    email_verified = EXCLUDED.email_verified;
  
  -- Create privacy settings with UPSERT to prevent duplicates
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;