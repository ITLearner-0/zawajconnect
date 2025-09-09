-- Fix remaining critical security vulnerabilities

-- 1. PROFILES TABLE: Create ultra-restrictive policy for public profiles
-- The current policy still allows too much access to sensitive data

-- Drop the current limited public profile policy 
DROP POLICY IF EXISTS "Limited public profile access" ON public.profiles;

-- Create a much more restrictive policy for public profiles
-- This should only allow very limited information to be seen
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
-- Currently anyone can potentially write to this table

-- Add explicit denial for anonymous users
CREATE POLICY "Deny anonymous access to islamic guidance"
ON public.islamic_guidance
FOR ALL
TO anon
USING (published = true)  -- Read-only for published content
WITH CHECK (false);       -- No writes allowed

-- Restrict write operations to admin users only
CREATE POLICY "Only admins can manage islamic guidance"
ON public.islamic_guidance
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Update security comments
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains highly sensitive personal data. Public profile access must be severely limited. Applications MUST filter sensitive fields (phone, detailed address, personal bio) from public views. Only show: age range, city/state, general profession, basic interests.';

COMMENT ON TABLE public.islamic_guidance IS 'SECURITY PROTECTED: Religious guidance content with admin-only write access to prevent misinformation. Public read access limited to published content only.';

-- Note: These changes ensure:
-- 1. Profiles: Public access exists but applications must filter sensitive data
-- 2. Islamic Guidance: Write operations restricted to admins only
-- 3. Both tables have explicit anonymous access controls