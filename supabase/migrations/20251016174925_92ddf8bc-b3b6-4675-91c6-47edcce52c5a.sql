-- Consolidate multiple overlapping UPDATE policies on profiles
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile with verification" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;

-- Create a single consolidated UPDATE policy that combines all conditions
CREATE POLICY "Consolidated profile update access"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Users can update their own profile
  (user_id = auth.uid())
)
WITH CHECK (
  -- Users can only update to valid states for their own profile
  (user_id = auth.uid())
);

-- Create supporting index for policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);