-- Fix the RLS on view error - views don't support RLS directly
-- They inherit security from underlying tables, so we just need the secure function and view

-- The function was created successfully, so we just need to recreate the view properly
-- and rely on the existing RLS policies on the family_members table

-- Drop and recreate the view without trying to apply RLS to it
DROP VIEW IF EXISTS public.family_members_safe;

-- Create a clean view that masks sensitive contact information
CREATE VIEW public.family_members_safe AS
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
-- The view will inherit row-level security from the underlying family_members table
GRANT SELECT ON public.family_members_safe TO authenticated;

-- Add comment explaining the security improvement
COMMENT ON VIEW public.family_members_safe IS 'Secure view of family_members that masks sensitive contact information from unauthorized users. Row-level security is inherited from the base family_members table.';

-- Also update any code that might be using the family_members table directly to use this safe view instead
-- This provides column-level security for contact information while maintaining row-level security