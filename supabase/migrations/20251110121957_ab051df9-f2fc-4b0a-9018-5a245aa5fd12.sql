-- Add SET search_path TO 'public' to remaining functions
-- This prevents search path manipulation attacks

-- Fix update_session_activity trigger function
CREATE OR REPLACE FUNCTION public.update_session_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$function$;

-- Fix increment_insight_views function
CREATE OR REPLACE FUNCTION public.increment_insight_views(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Verify user can only increment their own insights views
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only increment your own insights views';
  END IF;
  
  INSERT INTO insights_analytics (user_id, view_count, last_viewed_at, updated_at)
  VALUES (p_user_id, 1, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    view_count = insights_analytics.view_count + 1,
    last_viewed_at = NOW(),
    updated_at = NOW();
END;
$function$;

COMMENT ON FUNCTION public.increment_insight_views(uuid) IS 
'SECURITY DEFINER: Increments insight view count for authenticated user
Restrictions: User can only increment their own insights views
Security: Validates auth.uid() and ownership
Audit: No logging (low-risk operation)';
