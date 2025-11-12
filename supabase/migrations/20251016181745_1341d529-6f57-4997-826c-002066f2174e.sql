-- Consolidate multiple overlapping policies on family_notifications
-- This improves performance by reducing policy evaluation overhead

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Family members can access their notifications" ON public.family_notifications;
DROP POLICY IF EXISTS "Family members can update their notification status" ON public.family_notifications;
DROP POLICY IF EXISTS "Family members can view their notifications" ON public.family_notifications;
DROP POLICY IF EXISTS "System can create family notifications" ON public.family_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.family_notifications;

-- Create consolidated SELECT policy for reading notifications
CREATE POLICY "Family members can view their notifications"
ON public.family_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM family_members fm
    JOIN user_verifications uv ON uv.user_id = auth.uid()
    WHERE fm.id = family_notifications.family_member_id
      AND fm.invited_user_id = auth.uid()
      AND fm.invitation_status = 'accepted'
      AND fm.invitation_accepted_at > (now() - INTERVAL '14 days')
      AND uv.email_verified = true
      AND uv.verification_score >= 60
  )
);

-- Create consolidated UPDATE policy for updating notification status
CREATE POLICY "Family members can update notification status"
ON public.family_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM family_members fm
    JOIN user_verifications uv ON uv.user_id = auth.uid()
    WHERE fm.id = family_notifications.family_member_id
      AND fm.invited_user_id = auth.uid()
      AND fm.invitation_status = 'accepted'
      AND uv.email_verified = true
      AND uv.verification_score >= 60
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM family_members fm
    JOIN user_verifications uv ON uv.user_id = auth.uid()
    WHERE fm.id = family_notifications.family_member_id
      AND fm.invited_user_id = auth.uid()
      AND fm.invitation_status = 'accepted'
      AND uv.email_verified = true
      AND uv.verification_score >= 60
  )
);

-- System can insert notifications (for internal triggers and functions)
CREATE POLICY "System can create notifications"
ON public.family_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create supporting indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_family_notifications_family_member ON public.family_notifications(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_notifications_created ON public.family_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_family_notifications_unread ON public.family_notifications(is_read) WHERE is_read = false;