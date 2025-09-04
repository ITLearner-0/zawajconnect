-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Create a comprehensive function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table first
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  
  -- Insert into islamic_preferences
  INSERT INTO public.islamic_preferences (user_id)
  VALUES (NEW.id);
  
  -- Insert into user_verifications with email verified from auth
  INSERT INTO public.user_verifications (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL);
  
  -- Insert into privacy_settings with default values
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id);
  
  -- Insert into user_settings with default values
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR each ROW EXECUTE FUNCTION public.handle_new_user_complete();

-- Grant necessary permissions for the function to work
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;