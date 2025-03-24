
-- Function to safely get a user's session information
CREATE OR REPLACE FUNCTION public.get_user_session(user_id_param UUID)
RETURNS TABLE (
  status TEXT,
  last_active TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user_sessions table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_sessions'
  ) THEN
    -- Return user session data if the table exists
    RETURN QUERY
    SELECT 
      us.status,
      us.last_active
    FROM public.user_sessions us
    WHERE us.user_id = user_id_param;
  ELSE
    -- Return an empty result if the table doesn't exist
    RETURN;
  END IF;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_user_session IS 'Safely gets a user session by user ID, handling if the table doesn''t exist';

