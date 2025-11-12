-- Add invitation system for family members
ALTER TABLE public.family_members 
ADD COLUMN invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN invitation_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN invited_user_id UUID REFERENCES auth.users(id),
ADD COLUMN invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'expired'));

-- Create an index for faster invitation lookups
CREATE INDEX idx_family_members_invitation_token ON public.family_members(invitation_token);

-- Create function to send family invitation
CREATE OR REPLACE FUNCTION public.create_family_invitation(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_relationship TEXT,
  p_is_wali BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_token UUID;
  family_member_id UUID;
BEGIN
  -- Create family member record with invitation
  INSERT INTO public.family_members (
    user_id,
    full_name,
    email,
    relationship,
    is_wali,
    invitation_sent_at,
    invitation_status
  ) VALUES (
    p_user_id,
    p_full_name,
    p_email,
    p_relationship,
    p_is_wali,
    now(),
    'pending'
  ) RETURNING id, invitation_token INTO family_member_id, invitation_token;
  
  RETURN invitation_token;
END;
$$;

-- Create function to accept family invitation
CREATE OR REPLACE FUNCTION public.accept_family_invitation(
  p_invitation_token UUID,
  p_invited_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_member_record RECORD;
BEGIN
  -- Find the invitation
  SELECT * INTO family_member_record 
  FROM public.family_members 
  WHERE invitation_token = p_invitation_token 
    AND invitation_status = 'pending'
    AND invitation_sent_at > (now() - INTERVAL '7 days'); -- 7 day expiry
  
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
  
  RETURN TRUE;
END;
$$;