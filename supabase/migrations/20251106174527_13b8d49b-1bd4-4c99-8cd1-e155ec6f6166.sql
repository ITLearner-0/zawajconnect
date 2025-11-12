-- Add rating column to profile_comparison_history table
ALTER TABLE profile_comparison_history 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create index for rating for better sorting performance
CREATE INDEX idx_profile_comparison_history_rating ON profile_comparison_history (rating DESC NULLS LAST);