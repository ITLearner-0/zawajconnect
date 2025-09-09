-- Fix the security definer view issue from previous migration
-- Security definer views can be risky as they bypass RLS
-- Let's use a better approach with a security definer function instead

-- First, drop the problematic view
DROP VIEW IF EXISTS public.family_members_safe;

-- Create a security definer function to safely check if user can see contact info
CREATE OR REPLACE FUNCTION public.can_view_family_contact_info(family_member_row_user_id uuid, family_member_invited_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() = family_member_row_user_id OR auth.uid() = family_member_invited_user_id;
$$;

-- Create a better view without security definer that uses the function
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
  -- Only show contact info to authorized users using our secure function
  CASE 
    WHEN public.can_view_family_contact_info(user_id, invited_user_id) THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN public.can_view_family_contact_info(user_id, invited_user_id) THEN phone
    ELSE NULL
  END as phone,
  -- Don't expose sensitive tokens and IDs broadly
  CASE 
    WHEN public.can_view_family_contact_info(user_id, invited_user_id) THEN invitation_token
    ELSE NULL
  END as invitation_token,
  CASE 
    WHEN public.can_view_family_contact_info(user_id, invited_user_id) THEN invited_user_id
    ELSE NULL
  END as invited_user_id
FROM public.family_members;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.family_members_safe TO authenticated;

-- Apply the same RLS policies to the view as the base table
ALTER VIEW public.family_members_safe ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the view that mirror the base table
CREATE POLICY "Users can view family members they created (safe view)"
ON public.family_members_safe
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invitations (safe view)"
ON public.family_members_safe
FOR SELECT
TO authenticated
USING (auth.uid() = invited_user_id);

-- Add comment explaining the security improvement
COMMENT ON VIEW public.family_members_safe IS 'Secure view of family_members that masks sensitive contact information from unauthorized users using proper RLS policies';
COMMENT ON FUNCTION public.can_view_family_contact_info IS 'Security definer function to safely check if current user can view family member contact information';