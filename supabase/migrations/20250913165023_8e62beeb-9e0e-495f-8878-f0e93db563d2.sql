-- Update existing pending invitations to set invitation_sent_at
UPDATE public.family_members 
SET invitation_sent_at = created_at 
WHERE invitation_status = 'pending' AND invitation_sent_at IS NULL;