-- Remove the problematic view and use a cleaner approach
-- Views with auth.uid() functions can cause security definer issues

-- Drop the view that's causing the security definer warning
DROP VIEW IF EXISTS public.family_members_safe;

-- Instead, let's strengthen the existing RLS policies on the base table
-- The key insight is that we need to ensure there's no possibility of anonymous access

-- First, ensure there's an explicit policy denying anonymous access
DROP POLICY IF EXISTS "Prevent anonymous access to family members" ON public.family_members;
CREATE POLICY "Deny all anonymous access to family members"
ON public.family_members
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Ensure the authenticated access policy is clear and explicit
DROP POLICY IF EXISTS "Only authenticated users can access family members" ON public.family_members;

-- The existing policies are actually sufficient:
-- 1. "Users can manage family members they created" (user_id = auth.uid())
-- 2. "Users can view their own invitations" (invited_user_id = auth.uid())
-- 3. "Users can update their own invitation status" (invited_user_id = auth.uid())

-- Add one more explicit policy to make it crystal clear
CREATE POLICY "Explicit authenticated family member access"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  -- Only users who created the family member record
  -- OR users who are the invited party can access
  auth.uid() = user_id OR auth.uid() = invited_user_id
);

-- Update the security function comment to guide developers
COMMENT ON FUNCTION public.can_access_family_contact_info IS 'SECURITY: Use this function in your application code to determine if the current user should see email/phone fields. Even though RLS allows row access, sensitive contact info should be masked at the application level for users who are not direct participants.';

-- Add table comment for developer guidance
COMMENT ON TABLE public.family_members IS 'SECURITY WARNING: This table contains sensitive contact information (email, phone). Applications should use the can_access_family_contact_info() function to determine whether to display email/phone fields in the UI, even for authorized row access.';