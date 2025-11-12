-- Add tags column to profile_comparison_history table
ALTER TABLE profile_comparison_history 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tags array for better query performance
CREATE INDEX idx_profile_comparison_history_tags ON profile_comparison_history USING GIN (tags);