-- Fix family_members INSERT RLS policy to allow proper family member creation
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can create family member invitations" ON public.family_members;

-- Create new logical policy for INSERT
-- Allow users to create family members with proper invitation tracking
CREATE POLICY "Users can create family member invitations" 
ON public.family_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  -- invitation_sent_at will be set by the INSERT or trigger
  -- No restriction on email/phone for initial creation
  -- Rate limiting is handled by separate triggers
);

-- Ensure invitation_sent_at is set automatically if not provided
CREATE OR REPLACE FUNCTION public.set_invitation_sent_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set invitation_sent_at to now() if not provided
  IF NEW.invitation_sent_at IS NULL THEN
    NEW.invitation_sent_at := now();
  END IF;
  
  -- Set default invitation_status if not provided
  IF NEW.invitation_status IS NULL THEN
    NEW.invitation_status := 'pending';
  END IF;
  
  -- Generate invitation_token if not provided
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := gen_random_uuid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-set invitation fields
DROP TRIGGER IF EXISTS set_family_invitation_fields ON public.family_members;
CREATE TRIGGER set_family_invitation_fields
  BEFORE INSERT ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invitation_sent_at();