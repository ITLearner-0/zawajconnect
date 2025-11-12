-- Consolidate multiple permissive SELECT policies on user_verifications
-- This improves performance by reducing policy evaluation overhead

-- First, drop the redundant SELECT policies
DROP POLICY IF EXISTS "Family wali can view minimal verification status" ON public.user_verifications;
DROP POLICY IF EXISTS "Mutual matches can see basic verification flags" ON public.user_verifications;
DROP POLICY IF EXISTS "Users can view their own verification status (safe fields only)" ON public.user_verifications;

-- Create a single consolidated SELECT policy that combines all three conditions
CREATE POLICY "Consolidated verification status access"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (
  -- Self-access: users can view their own verification status
  (auth.uid() = user_id)
  OR
  -- Mutual matches: matched users can see basic verification flags
  (EXISTS (
    SELECT 1
    FROM matches m
    WHERE m.is_mutual = true
      AND m.can_communicate = true
      AND m.created_at > now() - interval '90 days'
      AND (
        (m.user1_id = auth.uid() AND m.user2_id = user_verifications.user_id) OR
        (m.user2_id = auth.uid() AND m.user1_id = user_verifications.user_id)
      )
  ))
  OR
  -- Wali minimal access: family wali can view minimal verification status
  (EXISTS (
    SELECT 1
    FROM family_members fm
    WHERE fm.invited_user_id = auth.uid()
      AND fm.user_id = user_verifications.user_id
      AND fm.invitation_status = 'accepted'
      AND fm.can_view_profile = true
      AND fm.is_wali = true
      AND fm.invitation_sent_at > now() - interval '30 days'
  ))
);

-- Add indexes to improve policy evaluation performance
-- Index on user_verifications
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id 
ON public.user_verifications(user_id);

-- Composite indexes on matches table for policy predicates
CREATE INDEX IF NOT EXISTS idx_matches_user1_mutual_communicate 
ON public.matches(user1_id, is_mutual, can_communicate, created_at);

CREATE INDEX IF NOT EXISTS idx_matches_user2_mutual_communicate 
ON public.matches(user2_id, is_mutual, can_communicate, created_at);

-- Composite indexes on family_members table for policy predicates
CREATE INDEX IF NOT EXISTS idx_family_members_invited_status_wali 
ON public.family_members(invited_user_id, invitation_status, is_wali, can_view_profile, invitation_sent_at);

CREATE INDEX IF NOT EXISTS idx_family_members_user_status_wali 
ON public.family_members(user_id, invitation_status, is_wali, can_view_profile, invitation_sent_at);