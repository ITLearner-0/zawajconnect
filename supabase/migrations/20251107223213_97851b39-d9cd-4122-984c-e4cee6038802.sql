-- Add onboarding_completed field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Update existing profiles that have bio and looking_for filled
UPDATE profiles 
SET onboarding_completed = true 
WHERE bio IS NOT NULL 
  AND bio != '' 
  AND looking_for IS NOT NULL 
  AND looking_for != '';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed) 
WHERE onboarding_completed = false;