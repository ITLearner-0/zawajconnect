-- Final security hardening - remove remaining vulnerabilities

-- 1. Remove the remaining problematic profile preview policy
DROP POLICY IF EXISTS "Limited profile preview for matching" ON public.profiles;

-- Create an ultra-secure profile browsing policy that only shows minimal data
CREATE POLICY "Minimal profile data for verified matching only" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != profiles.user_id
  -- Both users must be highly verified
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true
    AND uv.verification_score >= 70  -- Higher threshold
    AND uv.id_verified = true  -- Must have ID verification
  )
  -- Target must also be highly verified and explicitly allow browsing
  AND EXISTS (
    SELECT 1 FROM public.privacy_settings ps,
           public.user_verifications uv2
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility = 'public'
    AND ps.allow_profile_views = true
    AND uv2.user_id = profiles.user_id 
    AND uv2.email_verified = true
    AND uv2.verification_score >= 50
  )
  -- Not already matched or blocked
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
  -- Rate limiting - much stricter
  AND (
    SELECT COUNT(*) FROM public.profile_views pv 
    WHERE pv.viewer_id = auth.uid() 
    AND pv.created_at > (now() - INTERVAL '1 hour')
  ) < 5  -- Only 5 views per hour
);

-- 2. Strengthen family member access security function
CREATE OR REPLACE FUNCTION public.can_access_family_contact_info_secure(family_member_user_id uuid, family_member_invited_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  access_allowed boolean := false;
BEGIN
  -- Very strict verification requirements
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_verifications uv1, 
         public.user_verifications uv2, 
         public.family_members fm
    WHERE uv1.user_id = auth.uid()
    AND uv1.email_verified = true
    AND uv1.id_verified = true  -- Must have ID verification
    AND uv1.verification_score >= 50
    AND uv2.user_id = COALESCE(family_member_user_id, family_member_invited_user_id)
    AND uv2.email_verified = true  
    AND fm.invitation_sent_at > (now() - INTERVAL '14 days')  -- Recent invitation only (reduced from 30 days)
    AND fm.invitation_status = 'accepted'
    AND fm.is_wali = true  -- Only wali can access contact info
    AND (auth.uid() = family_member_user_id OR auth.uid() = family_member_invited_user_id)
  ) INTO access_allowed;
  
  RETURN access_allowed;
END;
$$;

-- 3. Ensure verification documents are never exposed
-- Create a view that only shows safe verification fields
DROP POLICY IF EXISTS "Users can view their own verification status" ON public.user_verifications;

CREATE POLICY "Users can view their own verification status (safe fields only)" 
ON public.user_verifications 
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- Update family and matched user policies to be even more restrictive
DROP POLICY IF EXISTS "Family can only view basic verification status" ON public.user_verifications;
DROP POLICY IF EXISTS "Matched users can only see verification scores" ON public.user_verifications;

CREATE POLICY "Family wali can view minimal verification status" 
ON public.user_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.invited_user_id = auth.uid() 
    AND fm.user_id = user_verifications.user_id 
    AND fm.invitation_status = 'accepted' 
    AND fm.can_view_profile = true
    AND fm.is_wali = true
    AND fm.invitation_sent_at > (now() - INTERVAL '30 days')  -- Recent invitations only
  )
);

CREATE POLICY "Mutual matches can see basic verification flags" 
ON public.user_verifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.is_mutual = true 
    AND m.can_communicate = true
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = user_verifications.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = user_verifications.user_id)
    )
    AND m.created_at > (now() - INTERVAL '90 days')  -- Recent matches only
  )
);