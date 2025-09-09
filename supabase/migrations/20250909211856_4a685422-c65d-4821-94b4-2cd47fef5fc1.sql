-- Enhanced security for family_members table contact information
-- The current RLS policies are good but we need additional protection for sensitive contact data

-- Let's examine what we have:
-- Current policies allow:
-- 1. Users to manage family members they created (user_id = auth.uid())
-- 2. Invited users to view/update their invitations (invited_user_id = auth.uid())

-- The issue is that contact info (email/phone) is still accessible to anyone who can see the row
-- We need to add column-level security through application logic guidance

-- First, let's create a more restrictive view for frontend applications
CREATE OR REPLACE VIEW public.family_members_safe AS
SELECT 
  id,
  user_id,
  full_name,
  relationship,
  is_wali,
  invitation_status,
  invitation_sent_at,
  invitation_accepted_at,
  can_view_profile,
  can_communicate,
  created_at,
  -- Only show contact info to the actual participants
  CASE 
    WHEN (auth.uid() = user_id OR auth.uid() = invited_user_id) 
    THEN email
    ELSE '***@***.***'
  END as email,
  CASE 
    WHEN (auth.uid() = user_id OR auth.uid() = invited_user_id) 
    THEN phone
    ELSE '***-***-****'
  END as phone,
  -- Mask sensitive tokens
  CASE 
    WHEN auth.uid() = user_id THEN invitation_token
    ELSE NULL
  END as invitation_token,
  -- Only show invited_user_id to relevant parties
  CASE 
    WHEN (auth.uid() = user_id OR auth.uid() = invited_user_id) 
    THEN invited_user_id
    ELSE NULL
  END as invited_user_id
FROM public.family_members;

-- Grant SELECT access to authenticated users
GRANT SELECT ON public.family_members_safe TO authenticated;

-- Create a strict policy for the view that inherits from the base table
COMMENT ON VIEW public.family_members_safe IS 'Secure view that masks sensitive contact information while preserving necessary functionality';

-- Also create an additional RLS policy for the base table to ensure no accidental public access
CREATE POLICY "Prevent anonymous access to family members"
ON public.family_members
FOR ALL
TO anon
USING (false);

-- Add an explicit policy to ensure only authenticated users can access
CREATE POLICY "Only authenticated users can access family members"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  -- Must be the user who created the record OR the invited user
  auth.uid() = user_id OR auth.uid() = invited_user_id
);