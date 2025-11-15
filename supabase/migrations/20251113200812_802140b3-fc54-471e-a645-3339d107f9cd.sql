-- Phase 2: High Priority Tables - Gamification, Matching, Verification, Security

-- =====================================================
-- GAMIFICATION TABLES
-- =====================================================

-- Table: user_badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_value INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_rarity ON user_badges(rarity);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- RLS Policies for user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their badge display order"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table: gamification_rewards
CREATE TABLE IF NOT EXISTS gamification_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('xp', 'badge', 'unlock', 'boost', 'premium_trial')),
  reward_amount INTEGER,
  reward_description TEXT NOT NULL,
  source_action TEXT NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gamification_rewards_user_id ON gamification_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_rewards_claimed ON gamification_rewards(claimed, expires_at);
CREATE INDEX IF NOT EXISTS idx_gamification_rewards_type ON gamification_rewards(reward_type);

-- RLS Policies for gamification_rewards
ALTER TABLE gamification_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON gamification_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can claim their rewards"
  ON gamification_rewards FOR UPDATE
  USING (auth.uid() = user_id AND NOT claimed)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create rewards"
  ON gamification_rewards FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- ADVANCED MATCHING TABLES
-- =====================================================

-- Table: match_compatibility_details
CREATE TABLE IF NOT EXISTS match_compatibility_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('islamic_values', 'lifestyle', 'family', 'personality', 'interests', 'goals')),
  category_score INTEGER NOT NULL CHECK (category_score >= 0 AND category_score <= 100),
  matching_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  differences JSONB NOT NULL DEFAULT '[]'::jsonb,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, category)
);

CREATE INDEX IF NOT EXISTS idx_compatibility_details_match_id ON match_compatibility_details(match_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_details_category ON match_compatibility_details(category);
CREATE INDEX IF NOT EXISTS idx_compatibility_details_score ON match_compatibility_details(category_score);

-- RLS Policies for match_compatibility_details
ALTER TABLE match_compatibility_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match participants can view compatibility details"
  ON match_compatibility_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND m.is_mutual = true
    )
  );

CREATE POLICY "System can manage compatibility details"
  ON match_compatibility_details FOR ALL
  USING (true)
  WITH CHECK (true);

-- Table: compatibility_score_breakdown
CREATE TABLE IF NOT EXISTS compatibility_score_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('religious_practice', 'family_values', 'life_goals', 'personality', 'lifestyle', 'communication')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id, dimension)
);

CREATE INDEX IF NOT EXISTS idx_score_breakdown_users ON compatibility_score_breakdown(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_score_breakdown_dimension ON compatibility_score_breakdown(dimension);
CREATE INDEX IF NOT EXISTS idx_score_breakdown_score ON compatibility_score_breakdown(score);

-- RLS Policies for compatibility_score_breakdown
ALTER TABLE compatibility_score_breakdown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their compatibility breakdowns"
  ON compatibility_score_breakdown FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can manage score breakdowns"
  ON compatibility_score_breakdown FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFICATION TABLES
-- =====================================================

-- Table: profile_verification_documents
CREATE TABLE IF NOT EXISTS profile_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'passport', 'driving_license', 'proof_of_residence', 'education_certificate', 'employment_proof', 'selfie_verification')),
  document_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'reviewing', 'verified', 'rejected', 'expired')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  expiry_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_user_id ON profile_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON profile_verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_verification_docs_type ON profile_verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_verification_docs_expiry ON profile_verification_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- RLS Policies for profile_verification_documents
ALTER TABLE profile_verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON profile_verification_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload documents"
  ON profile_verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can review documents"
  ON profile_verification_documents FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- SECURITY TABLES
-- =====================================================

-- Table: temporary_profile_access
CREATE TABLE IF NOT EXISTS temporary_profile_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view_only', 'view_and_message', 'full_access')),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > granted_at)
);

CREATE INDEX IF NOT EXISTS idx_temp_access_owner ON temporary_profile_access(profile_owner_id);
CREATE INDEX IF NOT EXISTS idx_temp_access_accessor ON temporary_profile_access(accessor_id);
CREATE INDEX IF NOT EXISTS idx_temp_access_expires ON temporary_profile_access(expires_at) WHERE NOT revoked;
CREATE INDEX IF NOT EXISTS idx_temp_access_active ON temporary_profile_access(revoked, expires_at);

-- RLS Policies for temporary_profile_access
ALTER TABLE temporary_profile_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile owners can view access grants"
  ON temporary_profile_access FOR SELECT
  USING (auth.uid() = profile_owner_id);

CREATE POLICY "Accessors can view their granted access"
  ON temporary_profile_access FOR SELECT
  USING (auth.uid() = accessor_id);

CREATE POLICY "Verified family members can grant access"
  ON temporary_profile_access FOR INSERT
  WITH CHECK (
    auth.uid() = granted_by
    AND has_family_relationship_security_definer(profile_owner_id)
  );

CREATE POLICY "Owners and granters can revoke access"
  ON temporary_profile_access FOR UPDATE
  USING (auth.uid() = profile_owner_id OR auth.uid() = granted_by)
  WITH CHECK (auth.uid() = profile_owner_id OR auth.uid() = granted_by);