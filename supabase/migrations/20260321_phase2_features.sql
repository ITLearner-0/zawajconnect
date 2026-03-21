-- F3: Score de Sérieux du Profil Public
-- Extends user_verifications with multi-factor trust score

-- Add new columns to user_verifications
ALTER TABLE user_verifications
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_age_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS login_regularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS compatibility_test_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_trust_score INTEGER DEFAULT 0;

-- Function to recalculate the trust score
CREATE OR REPLACE FUNCTION update_trust_score(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_profile_score INTEGER;
  v_login_score INTEGER;
  v_age_days INTEGER;
  v_email_verified BOOLEAN;
  v_id_verified BOOLEAN;
  v_compat_test BOOLEAN;
  v_total_score INTEGER;
BEGIN
  -- Calculate profile completion (based on filled fields in profiles)
  SELECT
    LEAST(100, (
      CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 10 ELSE 0 END +
      CASE WHEN age IS NOT NULL THEN 10 ELSE 0 END +
      CASE WHEN location IS NOT NULL THEN 10 ELSE 0 END +
      CASE WHEN about_me IS NOT NULL AND length(about_me) > 50 THEN 15 ELSE 0 END +
      CASE WHEN profile_picture IS NOT NULL THEN 20 ELSE 0 END +
      CASE WHEN occupation IS NOT NULL THEN 10 ELSE 0 END +
      CASE WHEN education IS NOT NULL THEN 10 ELSE 0 END +
      CASE WHEN religious_level IS NOT NULL THEN 15 ELSE 0 END
    ))
  INTO v_profile_score
  FROM profiles WHERE user_id = p_user_id;

  -- Account age
  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  INTO v_age_days
  FROM auth.users WHERE id = p_user_id;

  -- Login regularity (last 30 days)
  SELECT LEAST(100, COALESCE(COUNT(*), 0) * 5)::INTEGER
  INTO v_login_score
  FROM user_login_streaks
  WHERE user_id = p_user_id AND login_date >= NOW() - INTERVAL '30 days';

  -- Get verification flags
  SELECT email_verified, id_verified, compatibility_test_completed
  INTO v_email_verified, v_id_verified, v_compat_test
  FROM user_verifications
  WHERE user_id = p_user_id;

  -- Calculate total trust score
  v_total_score :=
    CASE WHEN COALESCE(v_email_verified, FALSE) THEN 20 ELSE 0 END +
    CASE WHEN COALESCE(v_id_verified, FALSE) THEN 30 ELSE 0 END +
    LEAST(COALESCE(v_profile_score, 0) * 25 / 100, 25) +
    LEAST(COALESCE(v_login_score, 0) * 15 / 100, 15) +
    CASE WHEN COALESCE(v_compat_test, FALSE) THEN 10 ELSE 0 END;

  -- Upsert the verification record
  INSERT INTO user_verifications (user_id, profile_completion_score, account_age_days, login_regularity_score, public_trust_score)
  VALUES (p_user_id, COALESCE(v_profile_score, 0), COALESCE(v_age_days, 0), COALESCE(v_login_score, 0), v_total_score)
  ON CONFLICT (user_id) DO UPDATE SET
    profile_completion_score = COALESCE(v_profile_score, 0),
    account_age_days = COALESCE(v_age_days, 0),
    login_regularity_score = COALESCE(v_login_score, 0),
    public_trust_score = v_total_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- F4: Istikhara & Réflexion Sessions
CREATE TABLE IF NOT EXISTS istikhara_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  candidate_user_id UUID REFERENCES auth.users(id) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  status TEXT CHECK (status IN ('active', 'decided_yes', 'decided_no', 'expired')) DEFAULT 'active',
  decision_note TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS istikhara_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES istikhara_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  day_number INTEGER CHECK (day_number BETWEEN 1 AND 7),
  content TEXT,
  mood TEXT CHECK (mood IN ('serene', 'uncertain', 'positive', 'doubtful', 'neutral')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE istikhara_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE istikhara_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Private istikhara" ON istikhara_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Private journal" ON istikhara_journal_entries FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_istikhara_user ON istikhara_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_istikhara_journal_session ON istikhara_journal_entries(session_id);

-- F7: Journey Progress Tracker
CREATE TABLE IF NOT EXISTS journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE ON DELETE CASCADE NOT NULL,
  step_profile_complete BOOLEAN DEFAULT FALSE,
  step_profile_complete_at TIMESTAMPTZ,
  step_test_complete BOOLEAN DEFAULT FALSE,
  step_test_complete_at TIMESTAMPTZ,
  step_first_match BOOLEAN DEFAULT FALSE,
  step_first_match_at TIMESTAMPTZ,
  step_first_supervised_exchange BOOLEAN DEFAULT FALSE,
  step_first_supervised_exchange_at TIMESTAMPTZ,
  step_istikhara_completed BOOLEAN DEFAULT FALSE,
  step_istikhara_completed_at TIMESTAMPTZ,
  step_family_meeting BOOLEAN DEFAULT FALSE,
  step_family_meeting_at TIMESTAMPTZ,
  step_nikah BOOLEAN DEFAULT FALSE,
  step_nikah_at TIMESTAMPTZ,
  current_step INTEGER DEFAULT 1,
  overall_progress_pct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journey_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey" ON journey_progress FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_journey_user ON journey_progress(user_id);

-- F1: AI Advisor Conversations
CREATE TABLE IF NOT EXISTS ai_advisor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT gen_random_uuid(),
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  context_type TEXT CHECK (context_type IN ('general', 'profile_review', 'compatibility', 'preparation')) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_advisor_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own conversations" ON ai_advisor_conversations FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_session ON ai_advisor_conversations(user_id, session_id);

-- F2: Family Meetings and Wali Delegation
CREATE TABLE IF NOT EXISTS family_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_user_id UUID REFERENCES auth.users(id) NOT NULL,
  candidate_user_id UUID REFERENCES auth.users(id) NOT NULL,
  ward_user_id UUID REFERENCES auth.users(id) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_type TEXT CHECK (meeting_type IN ('video', 'audio', 'text')) DEFAULT 'video',
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  meeting_link TEXT,
  wali_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wali_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_wali_id UUID REFERENCES auth.users(id) NOT NULL,
  delegate_wali_id UUID REFERENCES auth.users(id) NOT NULL,
  ward_user_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wali_user_id UUID REFERENCES auth.users(id) NOT NULL,
  candidate_user_id UUID REFERENCES auth.users(id) NOT NULL,
  ward_user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  criteria_scores JSONB DEFAULT '{}',
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE family_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wali_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wali manages own meetings" ON family_meetings FOR ALL USING (auth.uid() = wali_user_id);
CREATE POLICY "Wali manages own delegations" ON wali_delegations FOR ALL USING (auth.uid() = original_wali_id);
CREATE POLICY "Wali manages own reviews" ON family_reviews FOR ALL USING (auth.uid() = wali_user_id);

-- F5: Dynamic Values Profile
CREATE TABLE IF NOT EXISTS dynamic_values_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  religious_practice_score DECIMAL(5,2) DEFAULT 50,
  family_importance_score DECIMAL(5,2) DEFAULT 50,
  education_ambition_score DECIMAL(5,2) DEFAULT 50,
  social_lifestyle_score DECIMAL(5,2) DEFAULT 50,
  parenting_approach_score DECIMAL(5,2) DEFAULT 50,
  financial_approach_score DECIMAL(5,2) DEFAULT 50,
  total_questions_answered INTEGER DEFAULT 0,
  confidence_level DECIMAL(3,2) DEFAULT 0.10,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dynamic_values_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own values profile" ON dynamic_values_profile FOR ALL USING (auth.uid() = user_id);
-- Public read for matching
CREATE POLICY "Public values for matching" ON dynamic_values_profile FOR SELECT USING (true);

-- F6: Family Profile Contributions
CREATE TABLE IF NOT EXISTS family_profile_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contributor_user_id UUID REFERENCES auth.users(id) NOT NULL,
  contributor_role TEXT CHECK (contributor_role IN ('father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'other')) NOT NULL,
  section TEXT CHECK (section IN ('family_expectations', 'character_description', 'family_background', 'values_statement')) NOT NULL,
  content TEXT NOT NULL,
  is_approved_by_member BOOLEAN DEFAULT FALSE,
  is_visible_publicly BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_contributor_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  invited_role TEXT NOT NULL,
  invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE family_profile_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_contributor_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member sees own profile contributions" ON family_profile_contributions
  FOR SELECT USING (auth.uid() = profile_user_id);
CREATE POLICY "Contributor sees own" ON family_profile_contributions
  FOR ALL USING (auth.uid() = contributor_user_id);
CREATE POLICY "Public approved contributions visible" ON family_profile_contributions
  FOR SELECT USING (is_visible_publicly = TRUE AND is_approved_by_member = TRUE);

-- F8: Islamic Guidance user reads tracking
CREATE TABLE IF NOT EXISTS user_guidance_reads (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guidance_id UUID REFERENCES islamic_guidance(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, guidance_id)
);

ALTER TABLE user_guidance_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users track own reads" ON user_guidance_reads FOR ALL USING (auth.uid() = user_id);
