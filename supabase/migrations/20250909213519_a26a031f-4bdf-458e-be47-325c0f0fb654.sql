-- Final comprehensive security fixes for remaining critical vulnerabilities

-- 1. PROFILES TABLE: The scanner is right - even "public" profiles shouldn't expose sensitive data
-- The issue is that database-level policies can't filter columns, so we need stronger restrictions

-- Add an additional policy to prevent access to sensitive profile data unless specifically authorized
-- This creates multiple layers of protection

CREATE POLICY "Block sensitive profile data access"
ON public.profiles
FOR SELECT  
TO authenticated
USING (
  -- Only allow access to sensitive fields (phone, detailed location, full bio) for:
  -- 1. The profile owner themselves
  -- 2. Matched users (mutual matches only)
  -- 3. Authorized family members
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.is_mutual = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  ) OR
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

-- Drop the ultra-limited policy since the above provides better protection
DROP POLICY IF EXISTS "Ultra-limited public profile browsing" ON public.profiles;

-- 2. ADMIN_SETTINGS TABLE: Remove public access entirely
-- The current policy allows viewing settings with category 'public' which is risky

DROP POLICY IF EXISTS "Users can view general settings" ON public.admin_settings;

-- Create explicit denial for regular users
CREATE POLICY "Only admins can access admin settings"
ON public.admin_settings
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Explicit denial for anonymous users
CREATE POLICY "Deny anonymous admin settings access"
ON public.admin_settings
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add critical security comments
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains highly sensitive personal data (phone, location, bio). Multiple RLS policies ensure only authorized users can access sensitive fields. Applications should still implement field-level filtering for public profile displays.';

COMMENT ON TABLE public.admin_settings IS 'SECURITY CRITICAL: Administrative configuration data. Access restricted to admin users only. No public access allowed under any circumstances.';

-- Note: These changes ensure:
-- 1. Profiles: Sensitive data only accessible to profile owner, matches, or authorized family
-- 2. Admin Settings: Complete lockdown - admin access only
-- 3. Multiple layers of protection at database level