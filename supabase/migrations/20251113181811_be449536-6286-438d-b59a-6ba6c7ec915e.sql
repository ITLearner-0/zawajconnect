-- Add privacy_settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB 
DEFAULT '{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}'::jsonb;

-- Add is_visible column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN 
DEFAULT true;

-- Add blocked_users column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_users TEXT[] 
DEFAULT ARRAY[]::TEXT[];

-- Create index for faster blocked users lookups
CREATE INDEX IF NOT EXISTS idx_profiles_blocked_users 
ON public.profiles USING GIN(blocked_users);

-- Create index for visibility filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_visible 
ON public.profiles(is_visible) 
WHERE is_visible = true;

-- Update existing rows to have default values if NULL
UPDATE public.profiles 
SET privacy_settings = '{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}'::jsonb
WHERE privacy_settings IS NULL;

UPDATE public.profiles 
SET is_visible = true
WHERE is_visible IS NULL;

UPDATE public.profiles 
SET blocked_users = ARRAY[]::TEXT[]
WHERE blocked_users IS NULL;