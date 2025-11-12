-- Migration: Create insights analytics tables
-- Description: Tables pour tracker les analytics des insights de compatibilité

-- insights_analytics table
CREATE TABLE IF NOT EXISTS insights_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  share_count INTEGER DEFAULT 0,
  export_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_analytics_user_id 
  ON insights_analytics(user_id);

ALTER TABLE insights_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON insights_analytics 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON insights_analytics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON insights_analytics 
  FOR UPDATE USING (auth.uid() = user_id);

-- insight_actions table
CREATE TABLE IF NOT EXISTS insight_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'view_insights', 'share_insights', 'export_pdf', 'complete_test',
    'browse_profiles', 'improve_profile', 'read_guidance', 'retake_test', 'achievement_unlocked'
  )),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insight_actions_user_id 
  ON insight_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_actions_type 
  ON insight_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_insight_actions_created_at 
  ON insight_actions(created_at);

ALTER TABLE insight_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON insight_actions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON insight_actions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- achievement_unlocks table
CREATE TABLE IF NOT EXISTS achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_title TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_user_id 
  ON achievement_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_achievement_id 
  ON achievement_unlocks(achievement_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_achievement 
  ON achievement_unlocks(user_id, achievement_id);

ALTER TABLE achievement_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON achievement_unlocks 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievement_unlocks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_progression table
CREATE TABLE IF NOT EXISTS user_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  achievements_count INTEGER NOT NULL DEFAULT 0,
  insights_viewed_count INTEGER NOT NULL DEFAULT 0,
  last_level_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progression_user_id 
  ON user_progression(user_id);

ALTER TABLE user_progression ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progression" ON user_progression 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progression" ON user_progression 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progression" ON user_progression 
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour incrémenter atomiquement le compteur de vues
CREATE OR REPLACE FUNCTION increment_insight_views(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO insights_analytics (user_id, view_count, last_viewed_at, updated_at)
  VALUES (p_user_id, 1, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    view_count = insights_analytics.view_count + 1,
    last_viewed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_insights_analytics_updated_at ON insights_analytics;
CREATE TRIGGER update_insights_analytics_updated_at
  BEFORE UPDATE ON insights_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progression_updated_at ON user_progression;
CREATE TRIGGER update_user_progression_updated_at
  BEFORE UPDATE ON user_progression
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();