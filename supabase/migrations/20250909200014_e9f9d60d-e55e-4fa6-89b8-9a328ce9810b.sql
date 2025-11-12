-- Fix critical security vulnerabilities: islamic_preferences and user_verifications tables are publicly readable
-- These tables contain sensitive personal data that should only be accessible with proper authentication and privacy controls

-- Fix 1: Secure islamic_preferences table
-- This table contains detailed religious information that should be private

-- Drop existing overly permissive policy if it exists
DROP POLICY IF EXISTS "Users can view all Islamic preferences" ON public.islamic_preferences;

-- Create secure policies for islamic_preferences
-- Users can always view their own Islamic preferences
CREATE POLICY "Users can view their own Islamic preferences"
ON public.islamic_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Matched users can view each other's Islamic preferences (for compatibility matching)
CREATE POLICY "Matched users can view each other's Islamic preferences"
ON public.islamic_preferences
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.is_mutual = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = islamic_preferences.user_id) OR
      (m.user2_id = auth.uid() AND m.user1_id = islamic_preferences.user_id)
    )
  )
);

-- Family members can view supervised user's Islamic preferences (if family involvement is enabled)
CREATE POLICY "Family members can view supervised Islamic preferences"
ON public.islamic_preferences
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    JOIN public.privacy_settings ps ON ps.user_id = islamic_preferences.user_id
    WHERE fm.invited_user_id = auth.uid()
    AND fm.user_id = islamic_preferences.user_id
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND ps.allow_family_involvement = true
  )
);

-- Fix 2: Secure user_verifications table
-- This table contains verification status that should be private

-- Drop existing overly permissive policy if it exists
DROP POLICY IF EXISTS "Users can view verification status" ON public.user_verifications;

-- Create secure policies for user_verifications
-- Users can always view their own verification status
CREATE POLICY "Users can view their own verification status"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Matched users can view basic verification status of their matches (trust indicators)
CREATE POLICY "Matched users can view match verification status"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.is_mutual = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = user_verifications.user_id) OR
      (m.user2_id = auth.uid() AND m.user1_id = user_verifications.user_id)
    )
  )
);

-- Family members can view supervised user's verification status
CREATE POLICY "Family members can view supervised verification status"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.invited_user_id = auth.uid()
    AND fm.user_id = user_verifications.user_id
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
  )
);

-- Add comments explaining the security improvements
COMMENT ON TABLE public.islamic_preferences IS 'Islamic preferences table with secure RLS policies that protect sensitive religious data';
COMMENT ON TABLE public.user_verifications IS 'User verifications table with secure RLS policies that protect verification status information';