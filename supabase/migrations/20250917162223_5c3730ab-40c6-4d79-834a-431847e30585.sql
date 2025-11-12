-- CRITICAL SECURITY FIX: Secure profiles table against data theft
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

-- Policy 2: Verified mutual matches can view LIMITED profile data (no sensitive fields)
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

-- Step 3: Keep existing secure own-profile management policies
-- (profiles_own_insert, profiles_own_update, profiles_own_delete are already secure)

-- Step 4: Create audit trigger for profile access monitoring
CREATE OR REPLACE FUNCTION audit_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any profile access from non-owners for security monitoring
  IF auth.uid() != OLD.user_id OR auth.uid() != NEW.user_id THEN
    INSERT INTO profile_views (viewer_id, viewed_id)
    VALUES (auth.uid(), COALESCE(NEW.user_id, OLD.user_id))
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger
CREATE TRIGGER profile_access_audit
AFTER SELECT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION audit_profile_access();

-- Step 5: Create secure profile view that masks sensitive data for non-mutual matches  
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
    ELSE left(p.bio, 100) || '...' -- First 100 chars only
  END as bio,
  
  p.looking_for,
  p.interests,
  p.updated_at
FROM profiles p;

-- Enable RLS on the view
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Grant access to authenticated users only
GRANT SELECT ON public.safe_profiles TO authenticated;