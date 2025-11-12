-- Remove the dangerous public read policy
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

-- Create secure RLS policies for profile access
-- 1. Users can view their own profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Matched users can view each other's profiles
CREATE POLICY "Matched users can view each other's profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.is_mutual = true 
    AND (
      (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id) OR 
      (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
    )
  )
);

-- 3. Family members can view supervised profiles
CREATE POLICY "Family members can view supervised profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    JOIN public.privacy_settings ps ON ps.user_id = profiles.user_id
    WHERE fm.invited_user_id = auth.uid() 
    AND fm.user_id = profiles.user_id 
    AND fm.invitation_status = 'accepted' 
    AND fm.can_view_profile = true
    AND ps.allow_family_involvement = true
  )
);

-- 4. Limited public visibility based on privacy settings (for browsing)
CREATE POLICY "Public browsing with privacy controls" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.privacy_settings ps 
    WHERE ps.user_id = profiles.user_id 
    AND ps.profile_visibility = 'public'
  )
);