-- Consolidate multiple overlapping SELECT policies on moderation_logs
-- This improves performance by reducing policy evaluation overhead

-- Create helper function for moderation log access logic
CREATE OR REPLACE FUNCTION public.can_view_moderation_log(log_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Admins can view all logs OR users can view their own logs
  SELECT is_admin((SELECT auth.uid()))
    OR log_user_id = (SELECT auth.uid());
$$;

-- Revoke direct execution from roles
REVOKE EXECUTE ON FUNCTION public.can_view_moderation_log(uuid) FROM anon, authenticated;

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Admins can view all moderation logs" ON public.moderation_logs;
DROP POLICY IF EXISTS "Users can view their own moderation logs" ON public.moderation_logs;

-- Create consolidated SELECT policy
CREATE POLICY "Consolidated moderation log viewing access"
ON public.moderation_logs
FOR SELECT
TO authenticated
USING (
  can_view_moderation_log(user_id)
);

-- Create supporting index for policy performance
CREATE INDEX IF NOT EXISTS idx_moderation_logs_user_id ON public.moderation_logs(user_id);