-- Migration: Matches Answers Function - Phase 3
-- Created: 2025-11-27
-- Description: RPC function to get matches' answers for a specific question

-- =====================================================
-- FUNCTION: get_matches_answers_for_question
-- Returns answers from all mutual matches for a given question
-- =====================================================
CREATE OR REPLACE FUNCTION get_matches_answers_for_question(
  p_user_id UUID,
  p_question_id UUID
)
RETURNS TABLE (
  id UUID,
  answer_text TEXT,
  answer_date DATE,
  time_to_answer_seconds INTEGER,
  likes_count INTEGER,
  user_id UUID,
  profile JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH mutual_matches AS (
    -- Get all mutual matches for the user
    SELECT
      CASE
        WHEN user1_id = p_user_id THEN user2_id
        WHEN user2_id = p_user_id THEN user1_id
      END as match_user_id
    FROM matches
    WHERE is_mutual = true
    AND (user1_id = p_user_id OR user2_id = p_user_id)
  )
  SELECT
    uda.id,
    uda.answer_text,
    uda.answer_date,
    uda.time_to_answer_seconds,
    uda.likes_count,
    uda.user_id,
    jsonb_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name,
      'profile_picture', p.profile_picture,
      'location', p.location,
      'age', EXTRACT(YEAR FROM AGE(p.birth_date))
    ) as profile
  FROM user_daily_answers uda
  INNER JOIN mutual_matches mm ON mm.match_user_id = uda.user_id
  INNER JOIN profiles p ON p.user_id = uda.user_id
  WHERE uda.question_id = p_question_id
  AND uda.is_public = true
  AND uda.is_skipped = false
  ORDER BY uda.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_matches_answers_for_question(UUID, UUID) TO authenticated;

-- =====================================================
-- FUNCTION: get_question_engagement_stats
-- Returns engagement stats for a question (for Phase 4 analytics)
-- =====================================================
CREATE OR REPLACE FUNCTION get_question_engagement_stats(p_question_id UUID)
RETURNS TABLE (
  total_responses INTEGER,
  total_skips INTEGER,
  average_response_length INTEGER,
  total_likes INTEGER,
  engagement_rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_responses INTEGER;
  v_total_skips INTEGER;
  v_avg_length INTEGER;
  v_total_likes INTEGER;
  v_engagement DECIMAL;
BEGIN
  -- Get total responses (non-skipped)
  SELECT COUNT(*) INTO v_total_responses
  FROM user_daily_answers
  WHERE question_id = p_question_id
  AND is_skipped = false;

  -- Get total skips
  SELECT COUNT(*) INTO v_total_skips
  FROM user_daily_answers
  WHERE question_id = p_question_id
  AND is_skipped = true;

  -- Get average response length
  SELECT AVG(LENGTH(answer_text))::INTEGER INTO v_avg_length
  FROM user_daily_answers
  WHERE question_id = p_question_id
  AND is_skipped = false;

  -- Get total likes
  SELECT COALESCE(SUM(uda.likes_count), 0)::INTEGER INTO v_total_likes
  FROM user_daily_answers uda
  WHERE uda.question_id = p_question_id
  AND uda.is_skipped = false;

  -- Calculate engagement rate
  IF (v_total_responses + v_total_skips) > 0 THEN
    v_engagement := (v_total_responses::DECIMAL / (v_total_responses + v_total_skips)) * 100;
  ELSE
    v_engagement := 0;
  END IF;

  RETURN QUERY SELECT
    v_total_responses,
    v_total_skips,
    COALESCE(v_avg_length, 0),
    v_total_likes,
    ROUND(v_engagement, 2);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_question_engagement_stats(UUID) TO authenticated;

-- =====================================================
-- VIEW: user_answer_insights
-- Materialized view for user answer analytics (Phase 4)
-- =====================================================
CREATE OR REPLACE VIEW user_answer_insights AS
SELECT
  uda.user_id,
  COUNT(*) FILTER (WHERE uda.is_skipped = false) as total_answers,
  COUNT(*) FILTER (WHERE uda.is_skipped = true) as total_skips,
  SUM(uda.likes_count) as total_likes_received,
  SUM(uda.views_count) as total_views,
  AVG(LENGTH(uda.answer_text)) FILTER (WHERE uda.is_skipped = false) as avg_answer_length,
  COUNT(DISTINCT dq.category) as categories_answered,
  MAX(uda.answer_date) as last_answer_date,
  -- Calculate current streak (will be replaced by RPC call)
  0 as current_streak
FROM user_daily_answers uda
INNER JOIN daily_questions dq ON dq.id = uda.question_id
GROUP BY uda.user_id;

-- Grant permissions
GRANT SELECT ON user_answer_insights TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION get_matches_answers_for_question(UUID, UUID) IS
'Phase 3: Returns all public answers from mutual matches for a specific question';

COMMENT ON FUNCTION get_question_engagement_stats(UUID) IS
'Phase 4: Returns engagement statistics for analytics dashboard';

COMMENT ON VIEW user_answer_insights IS
'Phase 4: User-level insights for answer analytics';
