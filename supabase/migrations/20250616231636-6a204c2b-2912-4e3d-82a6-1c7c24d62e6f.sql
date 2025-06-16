
-- Add profile picture and gallery columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';

-- Add indexes for better performance on compatibility queries
CREATE INDEX IF NOT EXISTS idx_profiles_visible_gender 
ON public.profiles (is_visible, gender) 
WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_profiles_visible_location 
ON public.profiles (is_visible, location) 
WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_profiles_religious_practice 
ON public.profiles (religious_practice_level) 
WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_profiles_education 
ON public.profiles (education_level) 
WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_profiles_verified_visible 
ON public.profiles (is_visible, email_verified, phone_verified) 
WHERE is_visible = true;

-- Add composite index for compatibility matching performance
CREATE INDEX IF NOT EXISTS idx_compatibility_results_user_score 
ON public.compatibility_results (user_id, score DESC, created_at DESC);

-- Update profiles table to ensure proper constraints
ALTER TABLE public.profiles 
ALTER COLUMN gallery SET DEFAULT '{}';

-- Add a function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Ensure RLS policies exist for profiles table
DO $$
BEGIN
  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'profiles' 
    AND relrowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create basic RLS policies if they don't exist
DO $$
BEGIN
  -- Policy for users to view their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);
  END IF;

  -- Policy for users to update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;

  -- Policy for users to view visible profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view visible profiles'
  ) THEN
    CREATE POLICY "Users can view visible profiles" 
    ON public.profiles 
    FOR SELECT 
    USING (is_visible = true);
  END IF;
END $$;
