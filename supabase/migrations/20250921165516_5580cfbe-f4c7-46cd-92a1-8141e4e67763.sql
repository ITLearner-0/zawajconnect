-- Fix security warnings - Function Search Path Mutable
-- Update functions to have proper search_path settings

-- Fix check_family_operation_limit function
CREATE OR REPLACE FUNCTION public.check_family_operation_limit(
  p_user_id UUID, 
  p_operation_type TEXT, 
  p_daily_limit INTEGER DEFAULT 3
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current count and last reset
  SELECT operation_count, last_reset_at 
  INTO current_count, last_reset
  FROM public.family_operation_limits 
  WHERE user_id = p_user_id AND operation_type = p_operation_type;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.family_operation_limits (user_id, operation_type, operation_count)
    VALUES (p_user_id, p_operation_type, 0)
    ON CONFLICT (user_id, operation_type) DO NOTHING;
    RETURN TRUE;
  END IF;
  
  -- Reset count if more than 24 hours have passed
  IF last_reset < (now() - INTERVAL '24 hours') THEN
    UPDATE public.family_operation_limits 
    SET operation_count = 0, last_reset_at = now()
    WHERE user_id = p_user_id AND operation_type = p_operation_type;
    current_count := 0;
  END IF;
  
  -- Check if under limit
  RETURN current_count < p_daily_limit;
END;
$$;

-- Fix increment_family_operation_count function
CREATE OR REPLACE FUNCTION public.increment_family_operation_count(
  p_user_id UUID, 
  p_operation_type TEXT
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.family_operation_limits (user_id, operation_type, operation_count)
  VALUES (p_user_id, p_operation_type, 1)
  ON CONFLICT (user_id, operation_type) 
  DO UPDATE SET 
    operation_count = family_operation_limits.operation_count + 1;
END;
$$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, severity, description, metadata
  ) VALUES (
    p_user_id, p_event_type, p_severity, p_description, p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fix track_family_invitation function
CREATE OR REPLACE FUNCTION public.track_family_invitation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.increment_family_operation_count(NEW.user_id, 'family_invitation');
  RETURN NEW;
END;
$$;