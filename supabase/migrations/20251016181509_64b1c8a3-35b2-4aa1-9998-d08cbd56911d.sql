-- Consolidate multiple overlapping SELECT policies on family_supervision_rules
-- This improves performance by reducing policy evaluation overhead

-- Drop the redundant SELECT policies
DROP POLICY IF EXISTS "Users can manage their own supervision rules" ON public.family_supervision_rules;
DROP POLICY IF EXISTS "Users can view their own supervision rules" ON public.family_supervision_rules;

-- Create consolidated SELECT policy for reading own rules
CREATE POLICY "Users can view their own supervision rules"
ON public.family_supervision_rules
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Create separate policies for write operations (INSERT/UPDATE/DELETE)
CREATE POLICY "Users can insert their own supervision rules"
ON public.family_supervision_rules
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own supervision rules"
ON public.family_supervision_rules
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete their own supervision rules"
ON public.family_supervision_rules
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

-- Create supporting index for policy performance
CREATE INDEX IF NOT EXISTS idx_family_supervision_rules_user_id ON public.family_supervision_rules(user_id);