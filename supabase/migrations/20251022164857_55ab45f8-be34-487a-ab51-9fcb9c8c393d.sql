-- Fix: Create missing profiles for users without profiles
-- This fixes the invitation validation issue where users without profiles can't send invitations

-- First, create profiles for all users that don't have one
INSERT INTO public.profiles (
  id,
  user_id,
  full_name,
  age,
  gender,
  location,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Utilisateur'),
  25, -- default age
  'non_specifie', -- default gender
  'Non spécifié', -- default location
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update the handle_new_user_complete function to throw an error if profile creation fails
-- This ensures we catch profile creation issues immediately
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_full_name text;
BEGIN
  -- Get full_name from metadata or use default
  default_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile (MUST succeed)
  INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    age,
    gender,
    location,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,
    default_full_name,
    25, -- default age
    'non_specifie',
    'Non spécifié',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  -- Create other related records (can fail silently)
  BEGIN
    -- User status
    INSERT INTO public.user_status (user_id, status)
    VALUES (NEW.id, 'active')
    ON CONFLICT (user_id) DO NOTHING;

    -- Islamic preferences
    INSERT INTO public.islamic_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Privacy settings
    INSERT INTO public.privacy_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Verification status
    INSERT INTO public.verification_status (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

  EXCEPTION WHEN OTHERS THEN
    -- Log warning for related records but don't fail
    RAISE WARNING 'Error creating related records for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If profile creation fails, this is critical - raise error
  RAISE EXCEPTION 'CRITICAL: Failed to create profile for user %: %', NEW.id, SQLERRM;
END;
$$;