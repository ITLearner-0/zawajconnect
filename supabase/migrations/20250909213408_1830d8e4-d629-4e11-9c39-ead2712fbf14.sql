-- Fix remaining critical security vulnerabilities - corrected syntax

-- 1. PROFILES TABLE: Create ultra-restrictive policy for public profiles
-- Drop the current limited public profile policy 
DROP POLICY IF EXISTS "Limited public profile access" ON public.profiles;

-- Create a much more restrictive policy for public profiles
CREATE POLICY "Ultra-limited public profile browsing"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow access to public profiles for browsing/matching purposes
  -- Sensitive fields should be filtered at application level
  EXISTS (
    SELECT 1 FROM public.privacy_settings ps
    WHERE ps.user_id = profiles.user_id
    AND ps.profile_visibility = 'public'
    AND ps.allow_profile_views = true
  )
  -- Note: Applications MUST filter out phone, detailed location, and personal bio
  -- Only show: age, general location (city/state), profession (general), interests
);

-- 2. ISLAMIC_GUIDANCE TABLE: Fix missing write protection
-- Currently the table only has read policies

-- Add explicit denial for anonymous users on all operations
CREATE POLICY "Anonymous users can only read published guidance"
ON public.islamic_guidance
FOR SELECT
TO anon
USING (published = true);

-- Restrict write operations to admin users only - INSERT
CREATE POLICY "Only admins can create islamic guidance"
ON public.islamic_guidance
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Restrict write operations to admin users only - UPDATE  
CREATE POLICY "Only admins can update islamic guidance"
ON public.islamic_guidance
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Restrict write operations to admin users only - DELETE
CREATE POLICY "Only admins can delete islamic guidance"
ON public.islamic_guidance
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Update security comments
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains highly sensitive personal data. Public profile access must be severely limited. Applications MUST filter sensitive fields (phone, detailed address, personal bio) from public views. Only show: age range, city/state, general profession, basic interests.';

COMMENT ON TABLE public.islamic_guidance IS 'SECURITY PROTECTED: Religious guidance content with admin-only write access to prevent misinformation. Public read access limited to published content only.';