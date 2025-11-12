-- Fix admin panel access by removing the overly restrictive policy
-- The "Deny anonymous admin settings access" policy blocks ALL operations with 'false' condition
-- This prevents even admins from accessing settings, breaking admin functionality

DROP POLICY IF EXISTS "Deny anonymous admin settings access" ON admin_settings;

-- The remaining policies already provide proper security:
-- 1. "Admins can manage settings" - allows admins full access
-- 2. "Only admins can access admin settings" - restricts to admins only
-- These are sufficient for secure admin-only access