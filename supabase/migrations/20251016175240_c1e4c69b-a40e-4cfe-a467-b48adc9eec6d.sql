-- Consolidate multiple overlapping SELECT policies on profiles
-- This improves performance by reducing policy evaluation overhead

-- First, create helper functions to encapsulate complex access logic
-- These are STABLE SECURITY DEFINER to avoid RLS recursion and improve plan caching

CREATE OR REPLACE FUNCTION public.is_own_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_user_id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_family_supervised(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM family_members fm
    JOIN privacy_settings ps ON ps.user_id = profile_user_id
    WHERE fm.invited_user_id = (SELECT auth.uid())
      AND fm.user_id = profile_user_id
      AND fm.invitation_status = 'accepted'
      AND fm.can_view_profile = true
      AND ps.allow_family_involvement = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_wali(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM family_members fm
    JOIN user_verifications uv1 ON uv1.user_id = (SELECT auth.uid())
    JOIN user_verifications uv2 ON uv2.user_id = profile_user_id
    WHERE fm.invited_user_id = (SELECT auth.uid())
      AND fm.user_id = profile_user_id
      AND fm.invitation_status = 'accepted'
      AND fm.can_view_profile = true
      AND fm.is_wali = true
      AND fm.invitation_sent_at > (now() - INTERVAL '30 days')
      AND uv1.email_verified = true
      AND uv2.email_verified = true
      AND uv1.id_verified = true
      AND uv1.verification_score >= 70
  );
$$;

CREATE OR REPLACE FUNCTION public.is_matched_user(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM matches m
    WHERE m.is_mutual = true
      AND (
        (m.user1_id = (SELECT auth.uid()) AND m.user2_id = profile_user_id)
        OR (m.user2_id = (SELECT auth.uid()) AND m.user1_id = profile_user_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_public_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()) <> profile_user_id
    AND EXISTS (
      SELECT 1
      FROM privacy_settings ps
      JOIN user_verifications uv1 ON uv1.user_id = (SELECT auth.uid())
      JOIN user_verifications uv2 ON uv2.user_id = profile_user_id
      WHERE ps.user_id = profile_user_id
        AND ps.profile_visibility = 'public'
        AND uv1.email_verified = true
        AND uv1.verification_score >= 50
        AND uv2.email_verified = true
        AND uv2.verification_score >= 50
    );
$$;

-- Revoke direct execution from roles
REVOKE EXECUTE ON FUNCTION public.is_own_profile(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_family_supervised(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_family_wali(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_matched_user(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_view_public_profile(uuid) FROM anon, authenticated;

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Family members can view supervised profiles" ON public.profiles;
DROP POLICY IF EXISTS "Family members can view supervised profiles with ultra verifica" ON public.profiles;
DROP POLICY IF EXISTS "Family wali limited sensitive data access" ON public.profiles;
DROP POLICY IF EXISTS "Matched users can view each other's profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile with verification" ON public.profiles;
DROP POLICY IF EXISTS "Verified users can view public profiles with strict limits" ON public.profiles;
DROP POLICY IF EXISTS "Ultra verified family wali access" ON public.profiles;

-- Create a single consolidated SELECT policy that combines all conditions
CREATE POLICY "Consolidated profile viewing access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can view their own profile
  is_own_profile(user_id)
  OR
  -- Family members can view supervised profiles
  is_family_supervised(user_id)
  OR
  -- Family wali with proper verification
  is_family_wali(user_id)
  OR
  -- Matched users can view each other
  is_matched_user(user_id)
  OR
  -- Verified users can view public profiles
  can_view_public_profile(user_id)
);

-- Create supporting indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Indexes for family_members lookups
CREATE INDEX IF NOT EXISTS idx_family_members_invited_user ON public.family_members(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_status ON public.family_members(invitation_status);
CREATE INDEX IF NOT EXISTS idx_family_members_wali ON public.family_members(is_wali) WHERE is_wali = true;

-- Indexes for matches lookups
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON public.matches(user1_id) WHERE is_mutual = true;
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON public.matches(user2_id) WHERE is_mutual = true;

-- Indexes for privacy_settings lookups
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_visibility ON public.privacy_settings(profile_visibility);

-- Indexes for user_verifications lookups
CREATE INDEX IF NOT EXISTS idx_user_verifications_user ON public.user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_score ON public.user_verifications(verification_score);
CREATE INDEX IF NOT EXISTS idx_user_verifications_verified ON public.user_verifications(email_verified, id_verified);