-- Migration: Daily Question Achievements & Gamification - Phase 5
-- Created: 2025-11-27
-- Description: Badges and achievements for Daily Question engagement

-- =====================================================
-- FUNCTION: check_daily_question_achievements
-- Automatically awards badges based on answer streak
-- =====================================================
CREATE OR REPLACE FUNCTION check_daily_question_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER;
  v_total_answers INTEGER;
  v_badge_awarded BOOLEAN := false;
BEGIN
  -- Only process if not skipped
  IF NEW.is_skipped = true THEN
    RETURN NEW;
  END IF;

  -- Get current streak
  SELECT get_user_answer_streak(NEW.user_id) INTO v_streak;

  -- Get total answers
  SELECT COUNT(*) INTO v_total_answers
  FROM user_daily_answers
  WHERE user_id = NEW.user_id
  AND is_skipped = false;

  -- Award streak badges
  -- 7 Day Streak
  IF v_streak >= 7 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_streak_7',
      'Série de 7 Jours 🔥',
      'A répondu aux questions quotidiennes 7 jours d''affilée',
      '🔥',
      'engagement',
      'common',
      7,
      7
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- 30 Day Streak
  IF v_streak >= 30 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_streak_30',
      'Série de 30 Jours 💎',
      'A répondu aux questions quotidiennes 30 jours d''affilée',
      '💎',
      'engagement',
      'rare',
      30,
      30
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- 100 Day Streak
  IF v_streak >= 100 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_streak_100',
      'Série de 100 Jours 👑',
      'A répondu aux questions quotidiennes 100 jours d''affilée',
      '👑',
      'engagement',
      'epic',
      100,
      100
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- 365 Day Streak (1 year!)
  IF v_streak >= 365 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_streak_365',
      'Série d''un An 🏆',
      'A répondu aux questions quotidiennes 365 jours d''affilée - Incroyable !',
      '🏆',
      'engagement',
      'legendary',
      365,
      365
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- Milestone badges based on total answers
  -- First Answer
  IF v_total_answers = 1 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_first_answer',
      'Premier Pas 🌟',
      'A répondu à sa première question du jour',
      '🌟',
      'milestone',
      'common',
      1,
      1
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- 50 Answers
  IF v_total_answers >= 50 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_50_answers',
      'Penseur Engagé 🧠',
      'A répondu à 50 questions du jour',
      '🧠',
      'milestone',
      'rare',
      50,
      50
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- 100 Answers
  IF v_total_answers >= 100 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_100_answers',
      'Philosophe 📚',
      'A répondu à 100 questions du jour',
      '📚',
      'milestone',
      'epic',
      100,
      100
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- 365 Answers
  IF v_total_answers >= 365 THEN
    INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
    VALUES (
      NEW.user_id,
      'daily_question_365_answers',
      'Sage 🦉',
      'A répondu à 365 questions du jour - Une année de réflexion !',
      '🦉',
      'milestone',
      'legendary',
      365,
      365
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    v_badge_awarded := true;
  END IF;

  -- Engagement badges (likes received)
  DECLARE
    v_total_likes INTEGER;
  BEGIN
    SELECT SUM(likes_count) INTO v_total_likes
    FROM user_daily_answers
    WHERE user_id = NEW.user_id
    AND is_skipped = false;

    -- 50 Likes
    IF v_total_likes >= 50 THEN
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
      VALUES (
        NEW.user_id,
        'daily_question_50_likes',
        'Bien-Aimé 💕',
        'A reçu 50 likes sur ses réponses',
        '💕',
        'social',
        'rare',
        50,
        50
      )
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      v_badge_awarded := true;
    END IF;

    -- 200 Likes
    IF v_total_likes >= 200 THEN
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, badge_category, rarity, progress_current, progress_total)
      VALUES (
        NEW.user_id,
        'daily_question_200_likes',
        'Inspirant ✨',
        'A reçu 200 likes sur ses réponses',
        '✨',
        'social',
        'epic',
        200,
        200
      )
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      v_badge_awarded := true;
    END IF;
  END;

  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGER: Award badges after answer insertion
-- =====================================================
DROP TRIGGER IF EXISTS trigger_check_daily_question_achievements ON user_daily_answers;
CREATE TRIGGER trigger_check_daily_question_achievements
  AFTER INSERT ON user_daily_answers
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_question_achievements();

-- =====================================================
-- FUNCTION: get_daily_question_progress
-- Returns user's progress towards daily question badges
-- =====================================================
CREATE OR REPLACE FUNCTION get_daily_question_progress(p_user_id UUID)
RETURNS TABLE (
  badge_id TEXT,
  badge_name TEXT,
  badge_description TEXT,
  badge_icon TEXT,
  current_progress INTEGER,
  required_progress INTEGER,
  percentage DECIMAL,
  is_unlocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER;
  v_total_answers INTEGER;
  v_total_likes INTEGER;
BEGIN
  -- Get current stats
  SELECT get_user_answer_streak(p_user_id) INTO v_streak;

  SELECT COUNT(*) INTO v_total_answers
  FROM user_daily_answers
  WHERE user_id = p_user_id
  AND is_skipped = false;

  SELECT COALESCE(SUM(likes_count), 0) INTO v_total_likes
  FROM user_daily_answers
  WHERE user_id = p_user_id
  AND is_skipped = false;

  -- Return progress for all badges
  RETURN QUERY
  WITH badge_definitions AS (
    SELECT * FROM (VALUES
      ('daily_question_first_answer', 'Premier Pas 🌟', 'Répondre à sa première question', '🌟', 1, 'answers'),
      ('daily_question_streak_7', 'Série de 7 Jours 🔥', 'Répondre 7 jours d''affilée', '🔥', 7, 'streak'),
      ('daily_question_streak_30', 'Série de 30 Jours 💎', 'Répondre 30 jours d''affilée', '💎', 30, 'streak'),
      ('daily_question_streak_100', 'Série de 100 Jours 👑', 'Répondre 100 jours d''affilée', '👑', 100, 'streak'),
      ('daily_question_streak_365', 'Série d''un An 🏆', 'Répondre 365 jours d''affilée', '🏆', 365, 'streak'),
      ('daily_question_50_answers', 'Penseur Engagé 🧠', 'Répondre à 50 questions', '🧠', 50, 'answers'),
      ('daily_question_100_answers', 'Philosophe 📚', 'Répondre à 100 questions', '📚', 100, 'answers'),
      ('daily_question_365_answers', 'Sage 🦉', 'Répondre à 365 questions', '🦉', 365, 'answers'),
      ('daily_question_50_likes', 'Bien-Aimé 💕', 'Recevoir 50 likes', '💕', 50, 'likes'),
      ('daily_question_200_likes', 'Inspirant ✨', 'Recevoir 200 likes', '✨', 200, 'likes')
    ) AS t(id, name, description, icon, required, type)
  )
  SELECT
    bd.id::TEXT,
    bd.name::TEXT,
    bd.description::TEXT,
    bd.icon::TEXT,
    CASE
      WHEN bd.type = 'streak' THEN v_streak
      WHEN bd.type = 'answers' THEN v_total_answers
      WHEN bd.type = 'likes' THEN v_total_likes::INTEGER
    END AS current_progress,
    bd.required AS required_progress,
    ROUND(
      (CASE
        WHEN bd.type = 'streak' THEN v_streak::DECIMAL / bd.required
        WHEN bd.type = 'answers' THEN v_total_answers::DECIMAL / bd.required
        WHEN bd.type = 'likes' THEN v_total_likes::DECIMAL / bd.required
      END * 100)::DECIMAL,
      2
    ) AS percentage,
    EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id
      AND ub.badge_id = bd.id
    ) AS is_unlocked
  FROM badge_definitions bd
  ORDER BY bd.required ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_daily_question_achievements() TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_question_progress(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION check_daily_question_achievements() IS
'Phase 5: Automatically awards badges based on Daily Question engagement (streaks, milestones, likes)';

COMMENT ON FUNCTION get_daily_question_progress(UUID) IS
'Phase 5: Returns user progress towards all Daily Question badges with unlock status';
