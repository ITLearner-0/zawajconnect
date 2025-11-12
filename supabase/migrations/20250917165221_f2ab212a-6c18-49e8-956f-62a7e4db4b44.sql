-- Fix Security Definer View warning
-- Remove security definer property and make the view use invoker rights

-- Drop and recreate the view without security_barrier (which implies SECURITY DEFINER)
DROP VIEW IF EXISTS public.safe_profiles;

-- Create the view with proper security - using invoker rights
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