-- Fix critical security vulnerability: profiles table is publicly readable
-- Replace the overly permissive "Users can view all profiles" policy with secure, privacy-respecting policies

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure policies that respect privacy settings and authentication

-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can view profiles based on privacy settings
CREATE POLICY "Users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Profile must have privacy settings that allow viewing
  EXISTS (
    SELECT 1 FROM public.privacy_settings ps
    WHERE ps.user_id = profiles.user_id
    AND ps.profile_visibility = 'public'
    AND ps.allow_profile_views = true
  )
);

-- 3. Matched users can view each other's profiles (for dating app functionality)
CREATE POLICY "Matched users can view each other's profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users who have mutual matches can see each other's profiles
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.is_mutual = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
);

-- 4. Family members can view supervised user profiles (if family involvement is enabled)
CREATE POLICY "Family members can view supervised profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    JOIN public.privacy_settings ps ON ps.user_id = profiles.user_id
    WHERE fm.invited_user_id = auth.uid()
    AND fm.user_id = profiles.user_id
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND ps.allow_family_involvement = true
  )
);

-- Add comment explaining the security improvement
COMMENT ON TABLE public.profiles IS 'Profiles table with secure RLS policies that respect user privacy settings and require authentication';