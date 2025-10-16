-- Consolidate multiple overlapping SELECT policies on islamic_preferences
-- This improves performance by reducing policy evaluation overhead

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Family members can view supervised Islamic preferences" ON public.islamic_preferences;
DROP POLICY IF EXISTS "Matched users can view each other's Islamic preferences" ON public.islamic_preferences;
DROP POLICY IF EXISTS "Users can view their own Islamic preferences" ON public.islamic_preferences;

-- Create single consolidated SELECT policy
-- Combines all three access patterns: own, family supervised, and mutual matches
CREATE POLICY "Users can view Islamic preferences"
ON public.islamic_preferences
FOR SELECT
TO authenticated
USING (
  -- Users can view their own Islamic preferences
  user_id = (SELECT auth.uid())
  OR
  -- Family members can view supervised Islamic preferences
  EXISTS (
    SELECT 1
    FROM family_members fm
    JOIN privacy_settings ps ON ps.user_id = islamic_preferences.user_id
    WHERE fm.invited_user_id = (SELECT auth.uid())
      AND fm.user_id = islamic_preferences.user_id
      AND fm.invitation_status = 'accepted'
      AND fm.can_view_profile = true
      AND ps.allow_family_involvement = true
  )
  OR
  -- Matched users can view each other's Islamic preferences
  EXISTS (
    SELECT 1
    FROM matches m
    WHERE m.is_mutual = true
      AND (
        (m.user1_id = (SELECT auth.uid()) AND m.user2_id = islamic_preferences.user_id)
        OR (m.user2_id = (SELECT auth.uid()) AND m.user1_id = islamic_preferences.user_id)
      )
  )
);

-- Create supporting indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_islamic_preferences_user_id ON public.islamic_preferences(user_id);

-- Composite indexes for family member lookups (already exist from previous migrations)
-- idx_family_members_invited_user_id
-- idx_family_members_user_id
-- idx_family_members_status

-- Composite indexes for matches lookups (already exist from previous migrations)
-- idx_matches_user1 (WHERE is_mutual = true)
-- idx_matches_user2 (WHERE is_mutual = true)