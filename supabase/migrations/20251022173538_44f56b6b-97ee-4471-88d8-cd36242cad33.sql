-- Fix: Allow reading pending invitations by token without authentication
-- This is necessary for users to view invitation details before signing in/up

CREATE POLICY "Anyone can view pending invitations by token"
ON public.family_members
FOR SELECT
USING (
  invitation_status = 'pending'
  AND invitation_token IS NOT NULL
  AND invitation_sent_at IS NOT NULL
  AND invitation_sent_at > (now() - INTERVAL '30 days')
);