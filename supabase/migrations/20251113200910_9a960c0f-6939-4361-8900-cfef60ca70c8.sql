-- Phase 3: Medium Priority Tables - Configuration, Monitoring, Feedback

-- =====================================================
-- MATCHING ALGORITHM CONFIGURATION
-- =====================================================

-- Table: matching_algorithm_config
CREATE TABLE IF NOT EXISTS matching_algorithm_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name TEXT NOT NULL UNIQUE,
  config_version TEXT NOT NULL,
  weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_matching_config_active ON matching_algorithm_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_matching_config_name ON matching_algorithm_config(config_name);

-- RLS Policies for matching_algorithm_config
ALTER TABLE matching_algorithm_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage matching config"
  ON matching_algorithm_config FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view active config"
  ON matching_algorithm_config FOR SELECT
  USING (is_active = true);

-- Table: advanced_matching_criteria
CREATE TABLE IF NOT EXISTS advanced_matching_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  deal_breakers JSONB DEFAULT '[]'::jsonb,
  preferred_traits JSONB DEFAULT '[]'::jsonb,
  location_radius_km INTEGER DEFAULT 50 CHECK (location_radius_km >= 1 AND location_radius_km <= 500),
  age_range_min INTEGER CHECK (age_range_min >= 18 AND age_range_min <= 100),
  age_range_max INTEGER CHECK (age_range_max >= 18 AND age_range_max <= 100),
  education_preferences TEXT[],
  family_structure_preferences TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (age_range_max >= age_range_min)
);

CREATE INDEX IF NOT EXISTS idx_advanced_criteria_user ON advanced_matching_criteria(user_id);

-- RLS Policies for advanced_matching_criteria
ALTER TABLE advanced_matching_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own criteria"
  ON advanced_matching_criteria FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ACTIVITY MONITORING
-- =====================================================

-- Table: profile_activity_log
CREATE TABLE IF NOT EXISTS profile_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('profile_view', 'message_sent', 'like_sent', 'search_performed', 'filter_applied', 'profile_updated', 'photo_uploaded', 'match_accepted', 'video_call_started')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON profile_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON profile_activity_log(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_target ON profile_activity_log(target_user_id, created_at DESC) WHERE target_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON profile_activity_log(created_at DESC);

-- RLS Policies for profile_activity_log
ALTER TABLE profile_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON profile_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can log activities"
  ON profile_activity_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON profile_activity_log FOR SELECT
  USING (is_admin(auth.uid()));

-- Table: rate_limiting
CREATE TABLE IF NOT EXISTS rate_limiting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('profile_view', 'message_send', 'like_send', 'search', 'profile_update', 'photo_upload', 'video_call', 'report_submit')),
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_end TIMESTAMPTZ NOT NULL,
  limit_exceeded BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limiting_user_action ON rate_limiting(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limiting_window ON rate_limiting(window_end) WHERE NOT limit_exceeded;
CREATE INDEX IF NOT EXISTS idx_rate_limiting_exceeded ON rate_limiting(limit_exceeded, user_id) WHERE limit_exceeded = true;

-- RLS Policies for rate_limiting
ALTER TABLE rate_limiting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their rate limits"
  ON rate_limiting FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON rate_limiting FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- USER FEEDBACK
-- =====================================================

-- Table: user_feedback
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug_report', 'feature_request', 'general_feedback', 'complaint', 'praise')),
  category TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  page_url TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'closed', 'wont_fix')),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status, priority);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_priority ON user_feedback(priority) WHERE status != 'closed';

-- RLS Policies for user_feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage feedback"
  ON user_feedback FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO profile_activity_log (
    user_id,
    activity_type,
    target_user_id,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_target_user_id,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_limit INTEGER,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
  v_current_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now()) - (now()::time)::interval + (EXTRACT(MINUTE FROM now())::INTEGER % p_window_minutes) * INTERVAL '1 minute';
  v_window_end := v_window_start + (p_window_minutes || ' minutes')::interval;
  
  -- Get or create rate limit record
  SELECT action_count INTO v_current_count
  FROM rate_limiting
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start = v_window_start;
  
  IF v_current_count IS NULL THEN
    -- Create new record
    INSERT INTO rate_limiting (
      user_id,
      action_type,
      window_start,
      window_end,
      action_count,
      limit_exceeded
    ) VALUES (
      p_user_id,
      p_action_type,
      v_window_start,
      v_window_end,
      1,
      false
    );
    RETURN true;
  ELSIF v_current_count < p_limit THEN
    -- Increment count
    UPDATE rate_limiting
    SET action_count = action_count + 1,
        updated_at = now()
    WHERE user_id = p_user_id
      AND action_type = p_action_type
      AND window_start = v_window_start;
    RETURN true;
  ELSE
    -- Limit exceeded
    UPDATE rate_limiting
    SET limit_exceeded = true,
        updated_at = now()
    WHERE user_id = p_user_id
      AND action_type = p_action_type
      AND window_start = v_window_start;
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old activity logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM profile_activity_log
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limiting records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limiting
  WHERE window_end < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;