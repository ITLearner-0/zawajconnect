-- Fix the incorrect super admin assignment for regular users
-- First, update Sarah Croche to have the correct 'user' role instead of 'super_admin'
UPDATE public.user_roles 
SET role = 'user'
WHERE user_id = '9411b754-acf4-4ce5-a960-095775fe4d5f' 
AND role = 'super_admin';

-- Improve the handle_new_user_complete function to assign default 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use UPSERT for profiles table to avoid duplicates
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', profiles.full_name);
  
  -- Use UPSERT for islamic_preferences
  INSERT INTO public.islamic_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Use UPSERT for user_verifications with email verified from auth
  INSERT INTO public.user_verifications (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    email_verified = NEW.email_confirmed_at IS NOT NULL;
  
  -- Use UPSERT for privacy_settings with default values
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Use UPSERT for user_settings with default values
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Assign default 'user' role to new users
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'user', NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;