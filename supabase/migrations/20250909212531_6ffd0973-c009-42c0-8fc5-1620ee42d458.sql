-- Fix security vulnerability: islamic_moderation_rules table is publicly readable
-- This allows malicious users to study moderation keywords and bypass content filtering
-- This is a serious security risk as it exposes the entire content moderation system

-- First, remove the dangerous public access policy
DROP POLICY IF EXISTS "Users can view active rules" ON public.islamic_moderation_rules;

-- Add explicit denial for anonymous users
CREATE POLICY "Deny anonymous access to moderation rules"
ON public.islamic_moderation_rules
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Restrict access to admin users only - these rules are security-sensitive
CREATE POLICY "Only admins can view moderation rules"
ON public.islamic_moderation_rules
FOR SELECT
TO authenticated
USING (
  is_active = true AND 
  is_admin(auth.uid())
);

-- Allow admins to manage moderation rules
CREATE POLICY "Admins can manage moderation rules"
ON public.islamic_moderation_rules
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add security comments for developers
COMMENT ON TABLE public.islamic_moderation_rules IS 'SECURITY CRITICAL: Contains moderation keywords and detection logic. Public access would allow bad actors to craft messages that bypass content filtering. Access restricted to admin users only.';

-- Note: This change ensures that:
-- 1. Anonymous users cannot access any moderation rules
-- 2. Only admin users can view/manage moderation rules  
-- 3. Content filtering system details remain hidden from potential attackers
-- 4. The moderation system continues to work but is now secure