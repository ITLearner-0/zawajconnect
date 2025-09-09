-- Fix security vulnerability: islamic_moderation_rules table - work with existing policies
-- The table currently has an "Admins can manage moderation rules" policy already

-- First, remove the dangerous public access policy that allows anyone to view active rules
DROP POLICY IF EXISTS "Users can view active rules" ON public.islamic_moderation_rules;

-- Add explicit denial for anonymous users (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'islamic_moderation_rules' 
        AND policyname = 'Deny anonymous access to moderation rules'
    ) THEN
        CREATE POLICY "Deny anonymous access to moderation rules"
        ON public.islamic_moderation_rules
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
END $$;

-- Ensure only admins can view active moderation rules (create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'islamic_moderation_rules' 
        AND policyname = 'Only admins can view moderation rules'
    ) THEN
        CREATE POLICY "Only admins can view moderation rules"
        ON public.islamic_moderation_rules
        FOR SELECT
        TO authenticated
        USING (
          is_active = true AND 
          is_admin(auth.uid())
        );
    END IF;
END $$;

-- Add security comments for developers
COMMENT ON TABLE public.islamic_moderation_rules IS 'SECURITY CRITICAL: Contains moderation keywords and detection logic. Public access would allow bad actors to craft messages that bypass content filtering. Access restricted to admin users only.';

-- The existing "Admins can manage moderation rules" policy should handle INSERT/UPDATE/DELETE operations
-- This migration ensures that:
-- 1. Anonymous users cannot access any moderation rules
-- 2. Regular users cannot view moderation rules (removes public access)
-- 3. Only admin users can view/manage moderation rules
-- 4. Content filtering system details remain hidden from potential attackers