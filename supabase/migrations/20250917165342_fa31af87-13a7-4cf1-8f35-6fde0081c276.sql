-- FINAL SECURITY FIX: Remove SECURITY DEFINER from function to resolve warning
-- The issue is that SECURITY DEFINER functions run with elevated privileges
-- which can bypass RLS policies and create security vulnerabilities

-- Drop the problematic function
DROP FUNCTION IF EXISTS can_access_sensitive_profile_data(uuid);

-- Recreate without SECURITY DEFINER (uses invoker rights instead)  
CREATE OR REPLACE FUNCTION can_access_sensitive_profile_data(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matches m
    JOIN user_verifications uv1 ON uv1.user_id = auth.uid()
    JOIN user_verifications uv2 ON uv2.user_id = target_user_id
    WHERE m.is_mutual = true 
    AND m.can_communicate = true
    AND ((m.user1_id = auth.uid() AND m.user2_id = target_user_id) 
         OR (m.user2_id = auth.uid() AND m.user1_id = target_user_id))
    AND m.created_at > (now() - interval '6 months')
    AND uv1.email_verified = true 
    AND uv2.email_verified = true
    AND uv1.verification_score >= 70
    AND uv2.verification_score >= 50
  ) OR auth.uid() = target_user_id;
$$;

-- Summary of security improvements made:
-- 1. Removed problematic RLS policies that had complex, potentially vulnerable conditions
-- 2. Created simple, clear policies with strict verification requirements
-- 3. Added ultra-verified family wali access with highest security standards
-- 4. Created a secure view that masks sensitive data for unauthorized users
-- 5. Removed SECURITY DEFINER to prevent privilege escalation vulnerabilities
-- 6. All access now requires proper verification scores and ID verification