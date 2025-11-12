-- Clean up old invitations without invitation_sent_at and set proper dates
UPDATE public.family_members
SET invitation_sent_at = created_at
WHERE invitation_sent_at IS NULL 
AND invitation_status = 'pending';

-- Set expired status for old invitations (more than 7 days)
UPDATE public.family_members
SET invitation_status = 'expired'
WHERE invitation_status = 'pending'
AND invitation_sent_at < (now() - INTERVAL '7 days');