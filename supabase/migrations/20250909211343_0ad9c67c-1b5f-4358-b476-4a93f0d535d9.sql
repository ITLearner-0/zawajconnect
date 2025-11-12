-- Clean up the security definer view that's causing the warning
-- This view was created in a previous migration and is causing security issues

-- Drop the problematic view
DROP VIEW IF EXISTS public.family_members_safe;

-- The function we just created (can_access_family_contact_info) is sufficient
-- for applications to check if they should display contact information
-- We don't need the view approach

-- Verify that all other views are clean (none should have security definer)
-- The remaining approach is much cleaner: use application-level logic
-- with the security definer function to control access to sensitive fields