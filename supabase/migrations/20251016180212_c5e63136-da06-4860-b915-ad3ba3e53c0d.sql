-- Consolidate multiple overlapping SELECT policies on profile_matching_data
-- This improves performance by reducing policy evaluation overhead

-- Create helper function for ultra-verified matching data access logic
CREATE OR REPLACE FUNCTION public.can_view_matching_data(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- User can view their own matching data
  SELECT target_user_id = (SELECT auth.uid())
  OR
  (
    -- OR ultra-verified users can view public, visible profiles with rate limiting
    (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()) <> target_user_id
    AND EXISTS (
      SELECT 1 FROM profile_matching_data pmd
      WHERE pmd.user_id = target_user_id
        AND pmd.is_visible = true
    )
    AND EXISTS (
      SELECT 1 FROM user_verifications uv
      WHERE uv.user_id = (SELECT auth.uid())
        AND uv.email_verified = true
        AND uv.id_verified = true
        AND uv.verification_score >= 80
    )
    AND EXISTS (
      SELECT 1
      FROM user_verifications uv2
      JOIN privacy_settings ps ON ps.user_id = target_user_id
      WHERE uv2.user_id = target_user_id
        AND uv2.email_verified = true
        AND uv2.verification_score >= 60
        AND ps.profile_visibility = 'public'
    )
    AND (
      SELECT COUNT(*) FROM profile_views pv
      WHERE pv.viewer_id = (SELECT auth.uid())
        AND pv.created_at > (now() - INTERVAL '1 hour')
    ) < 2
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (
        (m.user1_id = (SELECT auth.uid()) AND m.user2_id = target_user_id)
        OR (m.user2_id = (SELECT auth.uid()) AND m.user1_id = target_user_id)
      )
    )
  );
$$;

-- Revoke direct execution from roles
REVOKE EXECUTE ON FUNCTION public.can_view_matching_data(uuid) FROM anon, authenticated;

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Ultra verified matching data access" ON public.profile_matching_data;
DROP POLICY IF EXISTS "Users can manage their own matching data" ON public.profile_matching_data;

-- Create consolidated SELECT policy
CREATE POLICY "Consolidated matching data viewing access"
ON public.profile_matching_data
FOR SELECT
TO authenticated
USING (
  can_view_matching_data(user_id)
);

-- Create separate policies for INSERT/UPDATE/DELETE (for own data only)
CREATE POLICY "Users can insert their own matching data"
ON public.profile_matching_data
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own matching data"
ON public.profile_matching_data
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete their own matching data"
ON public.profile_matching_data
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

-- Create supporting indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_profile_matching_data_user_id ON public.profile_matching_data(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_matching_data_visible ON public.profile_matching_data(is_visible) WHERE is_visible = true;

-- Indexes for profile_views rate limiting
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_created ON public.profile_views(viewer_id, created_at);

-- Composite index for matches existence checks
CREATE INDEX IF NOT EXISTS idx_matches_users_composite ON public.matches(user1_id, user2_id);