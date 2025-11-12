-- Priority 1: Critical Database Security Fixes
-- Fix conflicting RLS policies on key tables

-- 1. Fix Family Members RLS Policies
-- Drop conflicting policies
DROP POLICY IF EXISTS "Deny all anonymous access to family members" ON family_members;
DROP POLICY IF EXISTS "Family members basic info access only" ON family_members;
DROP POLICY IF EXISTS "Users can manage family invitations" ON family_members;

-- Create single, secure policy for family members
CREATE POLICY "Secure family member access" ON family_members
FOR ALL
USING (
  -- Users can access family members they created
  auth.uid() = user_id
  OR 
  -- Invited users can access after accepting invitation (within time limit)
  (
    auth.uid() = invited_user_id 
    AND invitation_status = 'accepted' 
    AND invitation_accepted_at > (now() - INTERVAL '30 days')
    AND invitation_sent_at > (now() - INTERVAL '7 days')
  )
)
WITH CHECK (
  -- Only allow creation/updates by the user who owns the record
  auth.uid() = user_id
  AND invitation_sent_at > (now() - INTERVAL '7 days')
);

-- 2. Fix Islamic Moderation Rules Access
-- Drop conflicting policies
DROP POLICY IF EXISTS "Deny anonymous access to moderation rules" ON islamic_moderation_rules;
DROP POLICY IF EXISTS "Only admins can view moderation rules" ON islamic_moderation_rules;

-- Create single admin-only policy
CREATE POLICY "Admin only moderation rules access" ON islamic_moderation_rules
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 3. Fix Compatibility Questions Access  
-- Drop conflicting policies
DROP POLICY IF EXISTS "Deny anonymous access to compatibility questions" ON compatibility_questions;
DROP POLICY IF EXISTS "Authenticated users only: active compatibility questions" ON compatibility_questions;
DROP POLICY IF EXISTS "Prevent bulk question access" ON compatibility_questions;

-- Create single verified user policy
CREATE POLICY "Verified users can access active questions" ON compatibility_questions
FOR SELECT
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true
    AND uv.verification_score >= 30
  )
);

-- 4. Enhanced Profile Matching Data Security
-- Update the existing policy to be more restrictive
DROP POLICY IF EXISTS "Highly verified users can view matching data only" ON profile_matching_data;

CREATE POLICY "Ultra verified matching data access" ON profile_matching_data
FOR SELECT
USING (
  -- Own data
  auth.uid() = user_id
  OR
  -- Highly verified users with strict limits
  (
    auth.uid() IS NOT NULL 
    AND auth.uid() <> user_id 
    AND is_visible = true
    -- Viewer must be highly verified
    AND EXISTS (
      SELECT 1 FROM user_verifications uv
      WHERE uv.user_id = auth.uid() 
      AND uv.email_verified = true 
      AND uv.id_verified = true
      AND uv.verification_score >= 80
    )
    -- Profile owner must be verified
    AND EXISTS (
      SELECT 1 FROM user_verifications uv2, privacy_settings ps
      WHERE uv2.user_id = profile_matching_data.user_id
      AND ps.user_id = profile_matching_data.user_id
      AND uv2.email_verified = true
      AND uv2.verification_score >= 60
      AND ps.profile_visibility = 'public'
    )
    -- Rate limiting: max 2 profile views per hour
    AND (
      SELECT count(*) FROM profile_views pv
      WHERE pv.viewer_id = auth.uid() 
      AND pv.created_at > (now() - INTERVAL '1 hour')
    ) < 2
    -- No existing match
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE ((m.user1_id = auth.uid() AND m.user2_id = profile_matching_data.user_id)
      OR (m.user2_id = auth.uid() AND m.user1_id = profile_matching_data.user_id))
    )
  )
);

-- 5. Enhanced Message Security
-- Add verification requirements to message access
DROP POLICY IF EXISTS "Users and family supervisors can send messages" ON messages;
DROP POLICY IF EXISTS "Users and family supervisors can view messages" ON messages;

-- Enhanced message insertion policy
CREATE POLICY "Verified users can send messages" ON messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND (
    -- Direct match participants (must be verified)
    (
      EXISTS (
        SELECT 1 FROM matches m, user_verifications uv
        WHERE m.id = messages.match_id
        AND ((m.user1_id = auth.uid() OR m.user2_id = auth.uid()))
        AND m.is_mutual = true
        AND m.can_communicate = true
        AND uv.user_id = auth.uid()
        AND uv.email_verified = true
      )
    )
    OR
    -- Family supervisors (highly verified walis only)
    (
      EXISTS (
        SELECT 1 FROM family_members fm, matches m, user_verifications uv
        WHERE m.id = messages.match_id
        AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
        AND fm.invited_user_id = auth.uid()
        AND fm.invitation_status = 'accepted'
        AND fm.can_communicate = true
        AND fm.is_wali = true
        AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
        AND uv.user_id = auth.uid()
        AND uv.email_verified = true
        AND uv.id_verified = true
        AND uv.verification_score >= 75
      )
    )
  )
);

-- Enhanced message viewing policy  
CREATE POLICY "Verified users can view messages" ON messages
FOR SELECT
USING (
  -- Match participants
  (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = messages.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  )
  OR
  -- Verified family supervisors
  (
    EXISTS (
      SELECT 1 FROM family_members fm, matches m, user_verifications uv
      WHERE m.id = messages.match_id
      AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
      AND fm.invited_user_id = auth.uid()
      AND fm.invitation_status = 'accepted'
      AND fm.can_view_profile = true
      AND uv.user_id = auth.uid()
      AND uv.email_verified = true
      AND uv.verification_score >= 50
    )
  )
);