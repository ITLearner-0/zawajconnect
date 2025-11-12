-- Remove redundant SELECT policy on user_sessions
-- The ALL policy already covers SELECT operations

-- Drop the redundant SELECT policy
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

-- Ensure the ALL policy is correctly scoped
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;

CREATE POLICY "Users can manage their own sessions"
ON public.user_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index to improve policy evaluation performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON public.user_sessions(user_id);