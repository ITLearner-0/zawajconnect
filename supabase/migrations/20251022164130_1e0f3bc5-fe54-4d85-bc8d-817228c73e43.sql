-- Update accept_family_invitation to check 30 days validity instead of 7
CREATE OR REPLACE FUNCTION public.accept_family_invitation(
  p_invitation_token uuid, 
  p_invited_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_member_record RECORD;
  recent_attempts integer;
BEGIN
  -- Rate limiting: Check recent acceptance attempts (max 5 per hour)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.family_members
  WHERE invited_user_id = p_invited_user_id
  AND invitation_accepted_at > (now() - INTERVAL '1 hour');
  
  IF recent_attempts >= 5 THEN
    RAISE EXCEPTION 'Too many invitation acceptance attempts. Please wait before trying again.';
  END IF;
  
  -- Find the invitation with 30 days validity
  SELECT * INTO family_member_record 
  FROM public.family_members 
  WHERE invitation_token = p_invitation_token 
    AND invitation_status = 'pending'
    AND invitation_sent_at IS NOT NULL
    AND invitation_sent_at > (now() - INTERVAL '30 days');
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Accept the invitation
  UPDATE public.family_members 
  SET 
    invitation_status = 'accepted',
    invitation_accepted_at = now(),
    invited_user_id = p_invited_user_id,
    can_view_profile = true,
    can_communicate = true
  WHERE invitation_token = p_invitation_token;
  
  -- Log the acceptance
  PERFORM log_security_event(
    p_invited_user_id,
    'family_invitation_accepted',
    'medium',
    'User accepted family invitation',
    jsonb_build_object(
      'invitation_token', p_invitation_token,
      'family_member_id', family_member_record.id
    )
  );
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't expose details
  PERFORM log_security_event(
    p_invited_user_id,
    'family_invitation_acceptance_failed',
    'high',
    'Failed to accept family invitation: ' || SQLERRM
  );
  RETURN FALSE;
END;
$$;