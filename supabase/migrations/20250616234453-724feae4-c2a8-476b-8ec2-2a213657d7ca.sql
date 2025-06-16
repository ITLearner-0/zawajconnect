
-- Fix the security vulnerability by setting a fixed search_path for handle_profile_compatibility_update function
CREATE OR REPLACE FUNCTION public.handle_profile_compatibility_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Check if fields that affect compatibility have changed
  IF (OLD.religious_practice_level IS DISTINCT FROM NEW.religious_practice_level) OR
     (OLD.location IS DISTINCT FROM NEW.location) OR
     (OLD.education_level IS DISTINCT FROM NEW.education_level) OR
     (OLD.birth_date IS DISTINCT FROM NEW.birth_date) THEN
    
    -- Mark this profile for compatibility recalculation
    -- This will trigger realtime notifications
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;
