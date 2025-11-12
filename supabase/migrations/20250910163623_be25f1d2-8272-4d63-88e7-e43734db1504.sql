-- Fix remaining infinite recursion errors in profiles and matches tables
-- The issue is circular references between policies that JOIN these tables

-- First, let's check and fix profiles table policies
-- Drop potentially problematic policies that might cause circular references

-- Drop duplicate or overly complex policies on profiles
DROP POLICY IF EXISTS "Matched users can view full profiles" ON public.profiles;

-- Simplify the "Matched users can view each other's profiles" policy to avoid recursion
DROP POLICY IF EXISTS "Matched users can view each other's profiles" ON public.profiles;

-- Create a simpler version that doesn't cause recursion
CREATE POLICY "Matched users can view each other's profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.is_mutual = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
);

-- Also check matches table policies that might reference profiles
-- The "Users can view matches" policy might be problematic

-- Let's simplify it to avoid the profiles table reference
DROP POLICY IF EXISTS "Users can view matches" ON public.matches;

CREATE POLICY "Users can view matches"
ON public.matches
FOR SELECT
TO authenticated
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Add comments for clarity
COMMENT ON POLICY "Matched users can view each other's profiles" ON public.profiles IS 'Simplified policy to avoid infinite recursion while allowing mutual match access';
COMMENT ON POLICY "Users can view matches" ON public.matches IS 'Simplified policy to avoid circular references with profiles table';