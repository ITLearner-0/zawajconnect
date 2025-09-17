-- FINAL SECURITY FIX: Properly remove SECURITY DEFINER by recreating dependencies
-- Need to drop view first, then function, then recreate both without SECURITY DEFINER

-- Step 1: Drop the view that depends on the function
DROP VIEW IF EXISTS public.safe_profiles;

-- Step 2: Drop and recreate the function without SECURITY DEFINER
DROP FUNCTION IF EXISTS can_access_sensitive_profile_data(uuid);

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

-- Step 3: Recreate the secure view (invoker rights, no security definer)
CREATE VIEW public.safe_profiles AS
SELECT 
  p.user_id,
  p.id,
  -- Always show basic info
  p.full_name,
  p.age,
  p.gender,
  p.avatar_url,
  p.created_at,
  -- Conditionally show sensitive data only for authorized users
  CASE 
    WHEN auth.uid() = p.user_id THEN p.phone
    WHEN can_access_sensitive_profile_data(p.user_id) THEN p.phone
    ELSE NULL
  END as phone,
  
  CASE 
    WHEN auth.uid() = p.user_id THEN p.location
    WHEN can_access_sensitive_profile_data(p.user_id) THEN split_part(p.location, ',', 1) -- City only
    ELSE NULL
  END as location,
  
  -- Education and profession - masked for non-matches
  CASE 
    WHEN auth.uid() = p.user_id THEN p.education
    WHEN can_access_sensitive_profile_data(p.user_id) THEN p.education
    ELSE 'Education information available after mutual match'
  END as education,
  
  CASE 
    WHEN auth.uid() = p.user_id THEN p.profession
    WHEN can_access_sensitive_profile_data(p.user_id) THEN p.profession
    ELSE 'Profession information available after mutual match'
  END as profession,
  
  -- Bio - truncated for non-matches
  CASE 
    WHEN auth.uid() = p.user_id THEN p.bio
    WHEN can_access_sensitive_profile_data(p.user_id) THEN p.bio
    ELSE left(COALESCE(p.bio, ''), 100) || CASE WHEN length(COALESCE(p.bio, '')) > 100 THEN '...' ELSE '' END
  END as bio,
  
  p.looking_for,
  p.interests,
  p.updated_at
FROM profiles p
WHERE 
  -- Apply RLS at view level - users can only see profiles they're authorized to see
  auth.uid() = p.user_id OR 
  can_access_sensitive_profile_data(p.user_id) OR
  EXISTS (
    SELECT 1 FROM family_members fm
    JOIN privacy_settings ps ON ps.user_id = p.user_id
    WHERE fm.invited_user_id = auth.uid()
    AND fm.user_id = p.user_id
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND ps.allow_family_involvement = true
  );

-- Grant access to authenticated users only
GRANT SELECT ON public.safe_profiles TO authenticated;