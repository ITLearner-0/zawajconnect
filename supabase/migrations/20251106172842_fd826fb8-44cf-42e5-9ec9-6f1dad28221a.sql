-- Create table for profile comparison history
CREATE TABLE IF NOT EXISTS profile_comparison_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compared_profile_ids TEXT[] NOT NULL,
  comparison_name TEXT,
  notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_comparison_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own comparison history"
  ON profile_comparison_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comparison history"
  ON profile_comparison_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparison history"
  ON profile_comparison_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparison history"
  ON profile_comparison_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_comparison_history_user_id ON profile_comparison_history(user_id);
CREATE INDEX idx_comparison_history_created_at ON profile_comparison_history(created_at DESC);
CREATE INDEX idx_comparison_history_favorites ON profile_comparison_history(user_id, is_favorite) WHERE is_favorite = true;