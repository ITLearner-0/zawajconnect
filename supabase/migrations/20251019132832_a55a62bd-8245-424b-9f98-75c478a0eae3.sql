-- Drop all existing policies on admin_settings to eliminate duplicates
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can access admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can create settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can view settings" ON public.admin_settings;

-- Create explicit policies for each operation on admin_settings
-- Using (SELECT auth.uid()) for stable query plans

CREATE POLICY "Admins can view settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (is_admin((SELECT auth.uid())));

CREATE POLICY "Admins can create settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (is_admin((SELECT auth.uid())));

CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (is_admin((SELECT auth.uid())))
WITH CHECK (is_admin((SELECT auth.uid())));

CREATE POLICY "Admins can delete settings"
ON public.admin_settings
FOR DELETE
TO authenticated
USING (is_admin((SELECT auth.uid())));