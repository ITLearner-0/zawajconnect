-- Create daily quests table
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  icon TEXT NOT NULL DEFAULT 'target',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user daily quest progress table
CREATE TABLE IF NOT EXISTS user_daily_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id, quest_date)
);

-- Enable RLS
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quest_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_quests
CREATE POLICY "Anyone can view active daily quests"
  ON daily_quests FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_daily_quest_progress
CREATE POLICY "Users can view own quest progress"
  ON user_daily_quest_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest progress"
  ON user_daily_quest_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest progress"
  ON user_daily_quest_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to assign daily quests to user
CREATE OR REPLACE FUNCTION assign_daily_quests_to_user(p_user_id UUID)
RETURNS TABLE(quest_id UUID, quest_type TEXT, title TEXT, description TEXT, target_value INTEGER, xp_reward INTEGER, icon TEXT) AS $$
DECLARE
  v_quest_date DATE := CURRENT_DATE;
BEGIN
  -- Check if user already has quests for today
  IF EXISTS (
    SELECT 1 FROM user_daily_quest_progress 
    WHERE user_id = p_user_id AND quest_date = v_quest_date
  ) THEN
    -- Return existing quests
    RETURN QUERY
    SELECT dq.id, dq.quest_type, dq.title, dq.description, dq.target_value, dq.xp_reward, dq.icon
    FROM daily_quests dq
    INNER JOIN user_daily_quest_progress udqp ON dq.id = udqp.quest_id
    WHERE udqp.user_id = p_user_id AND udqp.quest_date = v_quest_date;
  ELSE
    -- Assign 3 random active quests
    INSERT INTO user_daily_quest_progress (user_id, quest_id, quest_date)
    SELECT p_user_id, dq.id, v_quest_date
    FROM daily_quests dq
    WHERE dq.is_active = true
    ORDER BY RANDOM()
    LIMIT 3;
    
    -- Return assigned quests
    RETURN QUERY
    SELECT dq.id, dq.quest_type, dq.title, dq.description, dq.target_value, dq.xp_reward, dq.icon
    FROM daily_quests dq
    INNER JOIN user_daily_quest_progress udqp ON dq.id = udqp.quest_id
    WHERE udqp.user_id = p_user_id AND udqp.quest_date = v_quest_date;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample daily quests
INSERT INTO daily_quests (quest_type, title, description, target_value, xp_reward, icon) VALUES
  ('profile_views', 'Explorateur', 'Consultez 5 profils aujourd''hui', 5, 50, 'eye'),
  ('send_messages', 'Communicateur', 'Envoyez 3 messages', 3, 75, 'message-circle'),
  ('update_bio', 'Perfectionniste', 'Améliorez votre bio', 1, 100, 'edit'),
  ('complete_profile', 'Complétiste', 'Complétez une section de votre profil', 1, 150, 'check-circle'),
  ('login', 'Fidèle', 'Connectez-vous aujourd''hui', 1, 25, 'log-in'),
  ('add_photos', 'Photographe', 'Ajoutez une nouvelle photo', 1, 100, 'camera'),
  ('like_profiles', 'Enthousiaste', 'Likez 3 profils', 3, 60, 'heart'),
  ('compatibility_test', 'Analyste', 'Complétez un test de compatibilité', 1, 125, 'brain'),
  ('read_guidance', 'Sage', 'Lisez un article de guidance islamique', 1, 50, 'book-open'),
  ('update_preferences', 'Précis', 'Mettez à jour vos préférences de recherche', 1, 75, 'settings')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_user_daily_quest_progress_user_date ON user_daily_quest_progress(user_id, quest_date);
CREATE INDEX idx_user_daily_quest_progress_quest ON user_daily_quest_progress(quest_id);
CREATE INDEX idx_daily_quests_active ON daily_quests(is_active);