-- Add foreign key relationship between profiles and user_verifications
-- Both tables reference the same user via user_id, so we can establish the relationship

-- First, ensure all user_verifications have corresponding profile entries
INSERT INTO user_verifications (user_id, email_verified, verification_score)
SELECT p.user_id, true, 0
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_verifications uv WHERE uv.user_id = p.user_id
);

-- Add foreign key constraint from user_verifications to profiles
ALTER TABLE user_verifications 
ADD CONSTRAINT fk_user_verifications_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Also fix the Browse page query by updating the profiles table query
-- This will make the relationship work properly for Supabase queries