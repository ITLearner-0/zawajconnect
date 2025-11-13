-- Add login streak tracking columns to user_levels table
ALTER TABLE user_levels
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_levels_last_login ON user_levels(last_login_date);
CREATE INDEX IF NOT EXISTS idx_user_levels_streak ON user_levels(current_streak DESC);