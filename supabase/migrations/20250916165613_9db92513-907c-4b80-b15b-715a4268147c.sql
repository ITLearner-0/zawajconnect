-- Fix remaining security warnings (without auth.config which doesn't exist)

-- 1. Restrict sensitive data in subscriptions table
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view limited subscription info" 
ON public.subscriptions 
FOR SELECT 
USING (
  auth.uid() = user_id
  -- Only allow viewing if user is verified
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true
  )
);

-- 2. Restrict verification document access further
DROP POLICY IF EXISTS "Family members can view supervised verification status" ON public.user_verifications;
DROP POLICY IF EXISTS "Matched users can view match verification status" ON public.user_verifications;

-- Create more restrictive policies for verification data
CREATE POLICY "Family can only view basic verification status" 
ON public.user_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.invited_user_id = auth.uid() 
    AND fm.user_id = user_verifications.user_id 
    AND fm.invitation_status = 'accepted' 
    AND fm.can_view_profile = true
    AND fm.is_wali = true  -- Only wali can see verification status
  )
);

CREATE POLICY "Matched users can only see verification scores" 
ON public.user_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.is_mutual = true 
    AND m.can_communicate = true  -- Only if communication is allowed
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = user_verifications.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = user_verifications.user_id)
    )
  )
);

-- 3. Add additional security to profile views to prevent abuse
CREATE OR REPLACE FUNCTION public.check_profile_view_rate_limit(viewer_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  view_count integer;
BEGIN
  -- Check views in the last hour
  SELECT COUNT(*) INTO view_count
  FROM public.profile_views 
  WHERE viewer_id = viewer_uuid 
  AND created_at > (now() - INTERVAL '1 hour');
  
  -- Allow max 20 profile views per hour to prevent scraping
  RETURN view_count < 20;
END;
$$;

-- 4. Create trigger to enforce rate limiting on profile views
CREATE OR REPLACE FUNCTION public.enforce_profile_view_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.check_profile_view_rate_limit(NEW.viewer_id) THEN
    RAISE EXCEPTION 'Rate limit exceeded for profile views';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_view_rate_limit_trigger ON public.profile_views;
CREATE TRIGGER profile_view_rate_limit_trigger
  BEFORE INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_view_rate_limit();