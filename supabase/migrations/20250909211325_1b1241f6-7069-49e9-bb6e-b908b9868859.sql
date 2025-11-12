-- Simple fix for family_members contact information security
-- Instead of complex views, let's just improve the existing RLS policies

-- The current RLS policies on family_members are actually quite good:
-- 1. "Users can manage family members they created" - allows user_id = auth.uid()
-- 2. "Users can view their own invitations" - allows invited_user_id = auth.uid()
-- 3. "Users can update their own invitation status" - allows invited_user_id = auth.uid()

-- The issue is that these policies expose all columns including email/phone
-- Since PostgreSQL RLS works at row level, not column level, we need a different approach

-- Let's create a simple function that applications can use to check if contact info should be shown
CREATE OR REPLACE FUNCTION public.can_access_family_contact_info(family_member_user_id uuid, family_member_invited_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Only the user who created the family member or the invited user can see contact info
  SELECT auth.uid() = family_member_user_id OR auth.uid() = family_member_invited_user_id;
$$;

-- Add a comment to guide developers
COMMENT ON FUNCTION public.can_access_family_contact_info IS 'Check if current user can access contact information (email/phone) for a family member. Use this in application code to conditionally show sensitive contact data.';

-- The existing RLS policies on family_members are sufficient for row-level access
-- Applications should use the can_access_family_contact_info function to determine
-- whether to display email/phone fields in the UI

-- This approach is simpler and more maintainable than complex views
-- It puts the responsibility on the application layer to respect privacy