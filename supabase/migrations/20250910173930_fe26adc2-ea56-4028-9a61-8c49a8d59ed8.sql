-- Fix the handle_new_user trigger to use UPSERT instead of INSERT
-- This prevents duplicate key constraint violations

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT with ON CONFLICT to prevent duplicate key errors
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', profiles.full_name)
  WHERE profiles.full_name IS NULL OR profiles.full_name = '';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Erreur dans handle_new_user pour user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();