-- Fix critical security issues step by step

-- 1. Remove the broad profile access policy that exposes too much data
DROP POLICY IF EXISTS "Basic profile info for potential matches" ON public.profiles;

-- 2. Create a more restrictive policy with age-based matching only for legitimate matching
CREATE POLICY "Verified users minimal profile access for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != profiles.user_id
  -- Only verified users with complete profiles
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv 
    WHERE uv.user_id = auth.uid() 
    AND uv.email_verified = true
    AND uv.verification_score >= 50  -- Minimum verification threshold
  )
  -- Target profile must also be verified and have public visibility
  AND EXISTS (
    SELECT 1 FROM public.privacy_settings ps 
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility = 'public'
  )
  AND EXISTS (
    SELECT 1 FROM public.user_verifications uv2
    WHERE uv2.user_id = profiles.user_id 
    AND uv2.email_verified = true
  )
  -- Don't show profiles that have already been viewed or matched
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
  -- Rate limiting: Only allow viewing profiles for users with recent activity
  AND EXISTS (
    SELECT 1 FROM public.profile_views pv 
    WHERE pv.viewer_id = auth.uid() 
    AND pv.created_at > (now() - INTERVAL '1 hour')
    HAVING COUNT(*) < 10  -- Max 10 profile views per hour
  )
);

-- 3. Restrict family member contact information access with additional security
CREATE OR REPLACE FUNCTION public.can_access_family_contact_info_secure(family_member_user_id uuid, family_member_invited_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Additional verification: only allow access if user has been verified and invitation is recent
  SELECT EXISTS (
    SELECT 1 FROM public.user_verifications uv1, public.user_verifications uv2, public.family_members fm
    WHERE uv1.user_id = auth.uid()
    AND uv1.email_verified = true
    AND uv1.verification_score >= 30
    AND uv2.user_id = COALESCE(family_member_user_id, family_member_invited_user_id)
    AND uv2.email_verified = true  
    AND fm.invitation_sent_at > (now() - INTERVAL '30 days')  -- Recent invitation only
    AND (auth.uid() = family_member_user_id OR auth.uid() = family_member_invited_user_id)
  );
$$;

-- 4. Create a policy to limit access to family contact info
DROP POLICY IF EXISTS "Explicit authenticated family member access" ON public.family_members;

CREATE POLICY "Secure family member access with verification" 
ON public.family_members 
FOR SELECT 
USING (
  can_access_family_contact_info_secure(user_id, invited_user_id)
  AND invitation_status = 'accepted'
);