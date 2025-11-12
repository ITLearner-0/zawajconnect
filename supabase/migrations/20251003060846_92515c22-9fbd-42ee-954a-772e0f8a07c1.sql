-- Fix RLS policies on family_members to allow insertions correctly
-- The issue is that the current policies are too restrictive and may be blocking inserts

-- Drop existing problematic INSERT policy
DROP POLICY IF EXISTS "Users can create family member invitations" ON public.family_members;

-- Create a simpler, clearer INSERT policy that allows authenticated users to create family members
CREATE POLICY "Users can create their own family members"
ON public.family_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also ensure the SELECT policy allows users to see their pending invitations
-- (this helps with the rate limit triggers that need to count existing invitations)
DROP POLICY IF EXISTS "Family members secure access with contact protection" ON public.family_members;
DROP POLICY IF EXISTS "Invited users limited access to accepted invitations" ON public.family_members;

-- Create a more permissive SELECT policy for own family members
CREATE POLICY "Users can view their own family members"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR auth.uid() = invited_user_id
);

-- Keep the UPDATE policy as is
DROP POLICY IF EXISTS "Users can update own family member records" ON public.family_members;

CREATE POLICY "Users can update their own family members"
ON public.family_members
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);