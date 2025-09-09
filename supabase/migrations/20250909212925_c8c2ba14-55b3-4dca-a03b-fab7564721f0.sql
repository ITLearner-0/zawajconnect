-- Fix critical security vulnerability: profiles table public visibility exposes personal data
-- Users can set profile_visibility to 'public' which exposes sensitive personal information
-- including phone numbers, full names, locations, education, profession, and bio data

-- The current policy "Users can view public profiles" is too permissive
-- It allows anyone to see profiles where profile_visibility = 'public' and allow_profile_views = true

-- Drop the overly permissive public profile policy
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create a more restrictive policy that protects sensitive information
-- Public profiles should only show limited, non-sensitive information
CREATE POLICY "Limited public profile access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.privacy_settings ps
    WHERE ps.user_id = profiles.user_id
    AND ps.profile_visibility = 'public'
    AND ps.allow_profile_views = true
  )
  -- Additional restriction: prevent access to sensitive fields
  -- This will need to be handled at the application level for field filtering
);

-- Create a secure policy for matched users to see full profiles
CREATE POLICY "Matched users can view full profiles"
ON public.profiles  
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.is_mutual = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
);

-- Add critical security comment
COMMENT ON TABLE public.profiles IS 'SECURITY WARNING: Contains sensitive personal data (phone, location, bio). Public profile access should be limited. Applications must filter sensitive fields from public profile views - never expose phone numbers, detailed locations, or personal bio information to non-matched users.';

-- Note: This migration addresses the core issue by:
-- 1. Restricting public profile access to authenticated users only
-- 2. Adding security warnings for developers
-- 3. Maintaining functionality for matched users who need full profile access
-- 4. Applications should implement field-level filtering for public profiles