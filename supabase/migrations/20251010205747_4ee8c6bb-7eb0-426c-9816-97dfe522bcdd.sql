-- Update handle_new_user_complete to save terms consent data
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Profile with UPSERT optimized (now includes terms data)
  INSERT INTO public.profiles (
    user_id, 
    full_name,
    terms_accepted_at,
    terms_version
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamp with time zone,
    COALESCE(NEW.raw_user_meta_data ->> 'terms_version', '1.0')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', profiles.full_name),
    terms_accepted_at = COALESCE(
      (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamp with time zone,
      profiles.terms_accepted_at
    ),
    terms_version = COALESCE(
      NEW.raw_user_meta_data ->> 'terms_version',
      profiles.terms_version
    )
  WHERE profiles.full_name IS NULL OR profiles.full_name = '';
  
  -- 2. Islamic preferences with UPSERT
  INSERT INTO public.islamic_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 3. User verifications with email verified
  INSERT INTO public.user_verifications (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    email_verified = NEW.email_confirmed_at IS NOT NULL
  WHERE user_verifications.email_verified = false;
  
  -- 4. Privacy settings with defaults
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 5. User settings with defaults
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 6. User role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'user', NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_complete for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;