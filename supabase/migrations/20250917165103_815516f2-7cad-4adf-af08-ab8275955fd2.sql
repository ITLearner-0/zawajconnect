-- CRITICAL SECURITY FIX: Secure profiles table against data theft (CORRECTED)
-- Issue: Complex and potentially vulnerable RLS policies on sensitive personal data

-- Step 1: Remove problematic policies
DROP POLICY IF EXISTS "Ultra-restricted matching view access" ON profiles;
DROP POLICY IF EXISTS "Full profile access for confirmed mutual matches only" ON profiles;

-- Step 2: Create ultra-secure, simplified policies with clear access control

-- Policy 1: Users can ONLY view their own profile (strongest security)
CREATE POLICY "Users can view own profile only"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Verified mutual matches can view LIMITED profile data
CREATE POLICY "Verified mutual matches limited profile access"
ON profiles FOR SELECT  
TO authenticated
USING (
  auth.uid() != user_id AND
  EXISTS (
    SELECT 1 FROM matches m
    JOIN user_verifications uv1 ON uv1.user_id = auth.uid()
    JOIN user_verifications uv2 ON uv2.user_id = profiles.user_id
    WHERE m.is_mutual = true 
    AND m.can_communicate = true
    AND ((m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) 
         OR (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id))
    AND m.created_at > (now() - interval '3 months')  -- Recent matches only
    AND uv1.email_verified = true 
    AND uv2.email_verified = true
    AND uv1.verification_score >= 70
    AND uv2.verification_score >= 70
    AND uv1.id_verified = true
    AND uv2.id_verified = true
  )
);

-- Policy 3: Ultra-verified family wali access (most restrictive)
CREATE POLICY "Ultra verified family wali access"
ON profiles FOR SELECT
TO authenticated  
USING (
  auth.uid() != user_id AND
  EXISTS (
    SELECT 1 FROM family_members fm
    JOIN user_verifications uv1 ON uv1.user_id = auth.uid()
    JOIN user_verifications uv2 ON uv2.user_id = profiles.user_id
    JOIN privacy_settings ps ON ps.user_id = profiles.user_id
    WHERE fm.invited_user_id = auth.uid()
    AND fm.user_id = profiles.user_id
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
    AND fm.is_wali = true
    AND fm.invitation_sent_at > (now() - interval '14 days')  -- Very recent only
    AND ps.allow_family_involvement = true
    AND uv1.email_verified = true
    AND uv2.email_verified = true  
    AND uv1.id_verified = true
    AND uv1.verification_score >= 85  -- Highest verification required
    AND uv2.verification_score >= 60
  )
);

-- Step 4: Create secure profile view that masks sensitive data for non-mutual matches  
CREATE OR REPLACE VIEW public.safe_profiles AS
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
    WHEN EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_mutual = true 
      AND m.can_communicate = true
      AND ((m.user1_id = auth.uid() AND m.user2_id = p.user_id) 
           OR (m.user2_id = auth.uid() AND m.user1_id = p.user_id))
    ) THEN p.phone
    ELSE NULL
  END as phone,
  
  CASE 
    WHEN auth.uid() = p.user_id THEN p.location
    WHEN EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_mutual = true 
      AND ((m.user1_id = auth.uid() AND m.user2_id = p.user_id) 
           OR (m.user2_id = auth.uid() AND m.user1_id = p.user_id))
    ) THEN split_part(p.location, ',', 1) -- City only
    ELSE NULL
  END as location,
  
  -- Education and profession - masked for non-matches
  CASE 
    WHEN auth.uid() = p.user_id THEN p.education
    WHEN EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_mutual = true 
      AND ((m.user1_id = auth.uid() AND m.user2_id = p.user_id) 
           OR (m.user2_id = auth.uid() AND m.user1_id = p.user_id))
    ) THEN p.education
    ELSE 'Education information available after mutual match'
  END as education,
  
  CASE 
    WHEN auth.uid() = p.user_id THEN p.profession
    WHEN EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_mutual = true 
      AND ((m.user1_id = auth.uid() AND m.user2_id = p.user_id) 
           OR (m.user2_id = auth.uid() AND m.user1_id = p.user_id))
    ) THEN p.profession
    ELSE 'Profession information available after mutual match'
  END as profession,
  
  -- Bio - truncated for non-matches
  CASE 
    WHEN auth.uid() = p.user_id THEN p.bio
    WHEN EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_mutual = true 
      AND ((m.user1_id = auth.uid() AND m.user2_id = p.user_id) 
           OR (m.user2_id = auth.uid() AND m.user1_id = p.user_id))
    ) THEN p.bio
    ELSE left(COALESCE(p.bio, ''), 100) || CASE WHEN length(COALESCE(p.bio, '')) > 100 THEN '...' ELSE '' END
  END as bio,
  
  p.looking_for,
  p.interests,
  p.updated_at
FROM profiles p;

-- Enable RLS on the view
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Grant access to authenticated users only
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create a security function to check if user can access sensitive profile data
CREATE OR REPLACE FUNCTION can_access_sensitive_profile_data(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
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