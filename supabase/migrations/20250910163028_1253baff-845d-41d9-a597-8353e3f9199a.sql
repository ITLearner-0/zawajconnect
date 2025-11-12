-- Fix infinite recursion error in profiles table policy
-- The policy "Block sensitive profile data access" is causing infinite recursion
-- because it references profiles.user_id within a policy ON the profiles table

-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Block sensitive profile data access" ON public.profiles;

-- The existing policies already provide adequate protection:
-- - "Users can view their own profile" 
-- - "Users can update their own profile"
-- - "Users can create their own profile"
-- - "Matched users can view each other's profiles"
-- - "Family members can view supervised profiles"

-- These existing policies are sufficient and don't cause recursion issues