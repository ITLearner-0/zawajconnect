-- Completely fix profiles table policies and constraints
-- Remove ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Family members can view supervised profiles" ON public.profiles;
DROP POLICY IF EXISTS "Matched users can view each other's profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Disable and re-enable RLS to ensure clean slate
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create optimized policies without recursion
-- Everyone can view all profiles (for browsing functionality)
CREATE POLICY "profiles_public_read" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_own_insert" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "profiles_own_update" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own profile
CREATE POLICY "profiles_own_delete" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);