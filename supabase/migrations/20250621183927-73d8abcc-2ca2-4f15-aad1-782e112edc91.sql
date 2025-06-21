
-- Add wali invitation and confirmation system
ALTER TABLE public.wali_profiles 
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

-- Add supervision levels configuration
ALTER TABLE public.wali_profiles 
ADD COLUMN IF NOT EXISTS supervision_level TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS supervision_settings JSONB DEFAULT '{
  "require_approval_for_new_conversations": true,
  "receive_all_messages": false,
  "can_end_conversations": true,
  "notification_frequency": "immediate",
  "auto_approve_known_contacts": false
}'::jsonb;

-- Create wali invitations table for tracking invitation process
CREATE TABLE IF NOT EXISTS public.wali_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_profile_id UUID REFERENCES public.wali_profiles(id) ON DELETE CASCADE,
  managed_user_id UUID NOT NULL,
  invitation_token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on wali_invitations
ALTER TABLE public.wali_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for wali invitations - walis can see their own invitations
CREATE POLICY "Walis can view their own invitations" 
  ON public.wali_invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.wali_profiles 
      WHERE wali_profiles.id = wali_invitations.wali_profile_id 
      AND wali_profiles.user_id = auth.uid()
    )
  );

-- Policy for managed users to see invitations sent to them
CREATE POLICY "Users can view invitations for them" 
  ON public.wali_invitations 
  FOR SELECT 
  USING (managed_user_id = auth.uid());

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION public.generate_wali_invitation(
  wali_user_id UUID,
  managed_user_email TEXT
)
RETURNS TABLE(invitation_token TEXT, invitation_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  managed_user_id UUID;
  wali_profile_id UUID;
  new_token TEXT;
  new_invitation_id UUID;
BEGIN
  -- Find the managed user by email
  SELECT id INTO managed_user_id 
  FROM auth.users 
  WHERE email = managed_user_email;
  
  IF managed_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', managed_user_email;
  END IF;
  
  -- Get wali profile ID
  SELECT id INTO wali_profile_id
  FROM public.wali_profiles
  WHERE user_id = wali_user_id;
  
  IF wali_profile_id IS NULL THEN
    RAISE EXCEPTION 'Wali profile not found for user %', wali_user_id;
  END IF;
  
  -- Generate unique token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create invitation
  INSERT INTO public.wali_invitations (
    wali_profile_id,
    managed_user_id,
    invitation_token,
    email
  ) VALUES (
    wali_profile_id,
    managed_user_id,
    new_token,
    managed_user_email
  ) RETURNING id INTO new_invitation_id;
  
  -- Update wali profile with invitation info
  UPDATE public.wali_profiles 
  SET 
    invitation_status = 'sent',
    invitation_sent_at = now(),
    invitation_token = new_token
  WHERE id = wali_profile_id;
  
  RETURN QUERY SELECT new_token, new_invitation_id;
END;
$$;

-- Function to confirm wali invitation
CREATE OR REPLACE FUNCTION public.confirm_wali_invitation(
  token TEXT,
  confirming_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM public.wali_invitations
  WHERE invitation_token = token
    AND status = 'pending'
    AND expires_at > now();
    
  IF invitation_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verify the confirming user is the intended managed user
  IF invitation_record.managed_user_id != confirming_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Update invitation status
  UPDATE public.wali_invitations
  SET 
    status = 'confirmed',
    confirmed_at = now()
  WHERE id = invitation_record.id;
  
  -- Update wali profile
  UPDATE public.wali_profiles
  SET 
    invitation_status = 'confirmed',
    confirmed_at = now(),
    is_verified = true
  WHERE id = invitation_record.wali_profile_id;
  
  -- Update managed user's profile with wali info
  UPDATE public.profiles 
  SET 
    wali_name = (SELECT first_name || ' ' || last_name FROM public.wali_profiles WHERE id = invitation_record.wali_profile_id),
    wali_contact = (SELECT contact_information FROM public.wali_profiles WHERE id = invitation_record.wali_profile_id),
    wali_verified = true
  WHERE id = invitation_record.managed_user_id;
  
  -- Add to wali's managed users list
  UPDATE public.wali_profiles 
  SET managed_users = COALESCE(managed_users, '{}') || ARRAY[invitation_record.managed_user_id::text]
  WHERE id = invitation_record.wali_profile_id;
  
  RETURN TRUE;
END;
$$;
