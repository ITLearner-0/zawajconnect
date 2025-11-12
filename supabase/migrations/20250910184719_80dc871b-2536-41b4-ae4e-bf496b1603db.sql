-- Add INSERT policy for user_verifications table
-- Users should be able to create their own verification records

CREATE POLICY "Users can create their own verification records" 
ON public.user_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);