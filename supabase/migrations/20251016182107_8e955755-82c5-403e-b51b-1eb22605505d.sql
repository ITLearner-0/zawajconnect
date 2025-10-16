-- Final consolidation of all SELECT policies on profiles
-- Remove duplicate policies that overlap with the consolidated policy

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Consolidated profile viewing access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Verified mutual matches limited profile access" ON public.profiles;

-- Create single comprehensive SELECT policy
-- This combines all previous access patterns:
-- 1. Users can view their own profile
-- 2. Family members can view supervised profiles
-- 3. Family wali with proper verification
-- 4. Matched users can view each other
-- 5. Verified users can view public profiles
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Own profile access
  is_own_profile(user_id)
  OR
  -- Family supervised access
  is_family_supervised(user_id)
  OR
  -- Family wali access
  is_family_wali(user_id)
  OR
  -- Mutual match access
  is_matched_user(user_id)
  OR
  -- Public profile access for verified users
  can_view_public_profile(user_id)
);

-- All supporting indexes already exist from previous migrations
-- idx_profiles_user_id
-- idx_family_members_invited_user_id
-- idx_family_members_user_id
-- idx_family_members_status
-- idx_family_members_wali
-- idx_matches_user1
-- idx_matches_user2
-- idx_privacy_settings_user
-- idx_privacy_settings_visibility
-- idx_user_verifications_user_id
-- idx_user_verifications_score
-- idx_user_verifications_verified