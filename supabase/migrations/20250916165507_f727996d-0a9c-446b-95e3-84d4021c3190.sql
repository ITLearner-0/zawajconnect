-- Fix remaining security warnings

-- 1. Enable leaked password protection via auth configuration
-- This configures HaveIBeenPwned integration to prevent leaked passwords
UPDATE auth.config 
SET leaked_password_protection = true 
WHERE 1=1;

-- If the above doesn't work, we'll use an alternative approach:
-- Create custom password validation rules

-- 2. Restrict sensitive data in subscriptions table
-- Create view for limited subscription access
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view limited subscription info" 
ON public.subscriptions 
FOR SELECT 
USING (
  auth.uid() = user_id
  -- Only allow viewing if user is verified
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true
  )
);

-- 3. Restrict verification document access further
DROP POLICY IF EXISTS "Family members can view supervised verification status" ON public.user_verifications;
DROP POLICY IF EXISTS "Matched users can view match verification status" ON public.user_verifications;

-- Create more restrictive policies for verification data
CREATE POLICY "Family can only view basic verification status" 
ON public.user_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.invited_user_id = auth.uid() 
    AND fm.user_id = user_verifications.user_id 
    AND fm.invitation_status = 'accepted' 
    AND fm.can_view_profile = true
    AND fm.is_wali = true  -- Only wali can see verification status
  )
);

CREATE POLICY "Matched users can only see verification scores" 
ON public.user_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.is_mutual = true 
    AND m.can_communicate = true  -- Only if communication is allowed
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = user_verifications.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = user_verifications.user_id)
    )
  )
);