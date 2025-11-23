-- Fix search_path security vulnerability for all functions
-- This migration adds SET search_path = '' to all functions that don't have it set
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- Function to update search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$function$;

-- Fix handle_profile_update function
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix handle_message_insert function
CREATE OR REPLACE FUNCTION public.handle_message_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;

-- Fix handle_conversation_update function
CREATE OR REPLACE FUNCTION public.handle_conversation_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix increment_profile_view function
CREATE OR REPLACE FUNCTION public.increment_profile_view()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.profiles
  SET profile_views = COALESCE(profile_views, 0) + 1
  WHERE user_id = NEW.viewed_user_id;

  RETURN NEW;
END;
$function$;

-- Fix update_compatibility_on_preference_change function
CREATE OR REPLACE FUNCTION public.update_compatibility_on_preference_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Mark profile for compatibility recalculation
  UPDATE public.profiles
  SET updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- Fix handle_family_member_notification function
CREATE OR REPLACE FUNCTION public.handle_family_member_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert notification for family member invitation
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    created_at
  )
  VALUES (
    NEW.invited_user_id,
    'family_invitation',
    'Nouvelle invitation familiale',
    'Vous avez reçu une invitation à rejoindre une structure familiale',
    NOW()
  );

  RETURN NEW;
END;
$function$;

-- Fix handle_match_notification function
CREATE OR REPLACE FUNCTION public.handle_match_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
SECURITY DEFINER
AS $function$
DECLARE
  recipient_id uuid;
BEGIN
  -- Determine recipient (the other user in the match)
  IF NEW.user_id_1 = auth.uid() THEN
    recipient_id := NEW.user_id_2;
  ELSE
    recipient_id := NEW.user_id_1;
  END IF;

  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    created_at
  )
  VALUES (
    recipient_id,
    'new_match',
    'Nouveau match!',
    'Vous avez un nouveau match',
    NOW()
  );

  RETURN NEW;
END;
$function$;

-- Fix update_conversation_participants function
CREATE OR REPLACE FUNCTION public.update_conversation_participants()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update participants count and other metadata
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;

-- Fix cleanup_old_notifications function
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND is_read = true;
END;
$function$;

-- Fix update_subscription_status function
CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Dynamic fix for all remaining functions in public schema
-- This ensures any function not explicitly fixed above gets the search_path set
DO $$
DECLARE
  func_record RECORD;
  func_definition TEXT;
  fixed_definition TEXT;
BEGIN
  -- Loop through all functions in public schema that don't have search_path set
  FOR func_record IN
    SELECT
      p.proname as function_name,
      pg_get_functiondef(p.oid) as function_def,
      p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'  -- Only functions, not procedures
      AND NOT EXISTS (
        SELECT 1
        FROM pg_proc_config pc
        WHERE pc.setconfig::text LIKE '%search_path%'
          AND pc.oid = p.oid
      )
  LOOP
    -- Extract the function definition and add SET search_path = ''
    func_definition := func_record.function_def;

    -- Check if function definition contains 'AS' or 'BEGIN'
    IF func_definition LIKE '%AS $%' OR func_definition LIKE '%AS ''%' THEN
      -- Add search_path before the AS clause
      fixed_definition := regexp_replace(
        func_definition,
        '(LANGUAGE \w+)',
        '\1\nSET search_path = ''''',
        'gi'
      );

      -- Execute the modified function definition
      BEGIN
        EXECUTE fixed_definition;
        RAISE NOTICE 'Fixed search_path for function: %', func_record.function_name;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not auto-fix function %: %', func_record.function_name, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- Add comments
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column with search_path protection';
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile on user signup with search_path protection';
COMMENT ON FUNCTION public.handle_profile_update() IS 'Updates profile timestamp with search_path protection';
COMMENT ON FUNCTION public.handle_message_insert() IS 'Updates conversation on new message with search_path protection';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Search path security fix completed for all functions';
END $$;
