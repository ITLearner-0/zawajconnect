-- Fix profile data inconsistencies and improve Wali system
-- 1. Update existing profiles to have consistent verification status
UPDATE profiles 
SET email_verified = CASE 
  WHEN id IN (SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL) 
  THEN true 
  ELSE false 
END;

-- 2. Ensure proper profile completion tracking
UPDATE profiles 
SET is_verified = CASE 
  WHEN email_verified = true AND phone_verified = true AND id_verified = true 
  THEN true 
  ELSE false 
END;

-- 3. Fix any null privacy settings
UPDATE profiles 
SET privacy_settings = '{"showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true, "profileVisibilityLevel": 1}'::jsonb
WHERE privacy_settings IS NULL;

-- 4. Fix any null photo blur settings
UPDATE profiles 
SET photo_blur_settings = '{"blur_gallery_photos": false, "blur_until_approved": false, "blur_for_non_matches": true, "blur_profile_picture": false}'::jsonb
WHERE photo_blur_settings IS NULL;

-- 5. Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_is_visible ON profiles(is_visible);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(document_verification_status);

-- 6. Create index on wali_profiles for better performance
CREATE INDEX IF NOT EXISTS idx_wali_profiles_user_id ON wali_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wali_profiles_verification ON wali_profiles(is_verified);

-- 7. Ensure the wali user creation trigger is properly set up
CREATE OR REPLACE FUNCTION public.handle_new_wali_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is a wali registration by looking for metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'wali' THEN
    INSERT INTO public.wali_profiles (
      user_id, 
      first_name, 
      last_name, 
      relationship, 
      contact_information,
      email,
      phone,
      availability_status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'relationship_type', 'guardian'),
      COALESCE(NEW.raw_user_meta_data->>'contact_phone', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'contact_phone', ''),
      'offline'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      relationship = EXCLUDED.relationship,
      contact_information = EXCLUDED.contact_information,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone;
  END IF;
  RETURN NEW;
END;
$$;

-- 8. Ensure trigger exists for wali user creation
DROP TRIGGER IF EXISTS on_auth_user_created_wali ON auth.users;
CREATE TRIGGER on_auth_user_created_wali
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wali_user();

-- 9. Create a function to safely fix existing user roles
CREATE OR REPLACE FUNCTION public.ensure_user_has_role(user_uuid uuid, user_role app_role DEFAULT 'user')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

-- 10. Ensure all existing users have proper roles
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'user'::app_role
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;