-- Fix search path security issue in validate_password_strength function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  score integer := 0;
  issues text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    issues := array_append(issues, 'Password must be at least 8 characters long');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for uppercase
  IF password ~ '[A-Z]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase
  IF password ~ '[a-z]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for numbers
  IF password ~ '[0-9]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one number');
  END IF;
  
  -- Check for special characters
  IF password ~ '[^A-Za-z0-9]' THEN
    score := score + 1;
  ELSE
    issues := array_append(issues, 'Password must contain at least one special character');
  END IF;
  
  result := jsonb_build_object(
    'score', score,
    'max_score', 5,
    'is_strong', score >= 4,
    'issues', issues
  );
  
  RETURN result;
END;
$$;