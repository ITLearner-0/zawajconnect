-- SECURITY FIX: Strengthen SECURITY DEFINER function requirements
-- Increase verification score requirements and add rate limiting

-- 1. Update can_access_family_contact_info_secure to require higher verification score
CREATE OR REPLACE FUNCTION public.can_access_family_contact_info_secure(
  family_member_user_id uuid, 
  family_member_invited_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_allowed boolean := false;
BEGIN
  -- Increased verification requirements to match get_family_contact_secure()
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_verifications uv1, 
         public.user_verifications uv2, 
         public.family_members fm
    WHERE uv1.user_id = auth.uid()
    AND uv1.email_verified = true
    AND uv1.id_verified = true
    AND uv1.verification_score >= 85  -- Increased from 50 to 85
    AND uv2.user_id = COALESCE(family_member_user_id, family_member_invited_user_id)
    AND uv2.email_verified = true
    AND fm.invitation_sent_at > (now() - INTERVAL '14 days')
    AND fm.invitation_status = 'accepted'
    AND fm.is_wali = true
    AND (auth.uid() = family_member_user_id OR auth.uid() = family_member_invited_user_id)
  ) INTO access_allowed;
  
  RETURN access_allowed;
END;
$$;

-- 2. Add rate limiting to accept_family_invitation function
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
  
  -- Find the invitation
  SELECT * INTO family_member_record 
  FROM public.family_members 
  WHERE invitation_token = p_invitation_token 
    AND invitation_status = 'pending'
    AND invitation_sent_at > (now() - INTERVAL '7 days');
  
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