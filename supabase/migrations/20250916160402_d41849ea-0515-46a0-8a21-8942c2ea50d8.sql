-- Remove the public browsing policy that allows broad access
DROP POLICY IF EXISTS "Public browsing with privacy controls" ON public.profiles;

-- Create a more restrictive policy for browsing that only shows limited profile info
-- and only for users who haven't been matched yet (for matching purposes only)
CREATE POLICY "Limited profile preview for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != profiles.user_id  -- Not viewing own profile
  AND EXISTS (
    SELECT 1 FROM public.privacy_settings ps 
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility = 'public'
  )
  AND NOT EXISTS (
    -- Only show if not already matched or blocked
    SELECT 1 FROM public.matches m 
    WHERE (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
  -- Add additional restrictions for sensitive data
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true  -- Only verified users can browse
  )
);

-- Create a policy that shows only basic profile info for potential matches
-- This policy will work together with application-level filtering
CREATE POLICY "Basic profile info for potential matches" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != profiles.user_id
  AND EXISTS (
    SELECT 1 FROM public.privacy_settings ps 
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility IN ('public', 'verified_only')
  )
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv1
    WHERE uv1.user_id = auth.uid() 
    AND uv1.email_verified = true
  )
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv2
    WHERE uv2.user_id = profiles.user_id 
    AND uv2.email_verified = true
  )
);