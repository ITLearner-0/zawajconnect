
-- Function to set up profile policies
CREATE OR REPLACE FUNCTION public.setup_profile_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view other visible profiles" ON public.profiles;
  
  -- Create policies for profiles table
  CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
    
  CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
    
  CREATE POLICY "Users can view other visible profiles"
    ON public.profiles
    FOR SELECT
    USING (
      id != auth.uid() AND 
      is_visible = true AND
      (NOT (auth.uid()::text = ANY(blocked_users)) OR blocked_users IS NULL)
    );
    
  RETURN true;
END;
$$;
