-- Fix RLS policies for better access control

-- Update user_verifications policy to allow viewing other users' verification status (for profile viewing)
DROP POLICY "Users can view their own verification status" ON public.user_verifications;

CREATE POLICY "Users can view verification status" 
ON public.user_verifications 
FOR SELECT 
USING (true);

-- Ensure profile_views has proper INSERT policy without foreign key issues
DROP POLICY IF EXISTS "Users can create profile views" ON public.profile_views;

CREATE POLICY "Users can create profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

-- Add UPSERT policy for profile_views to handle conflicts
CREATE POLICY "Users can upsert profile views" 
ON public.profile_views 
FOR UPDATE 
USING (auth.uid() = viewer_id)
WITH CHECK (auth.uid() = viewer_id);

-- Ensure matches table has proper policies for viewing matches between users
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;

CREATE POLICY "Users can view matches" 
ON public.matches 
FOR SELECT 
USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id) OR EXISTS(
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_id IN (matches.user1_id, matches.user2_id)
));