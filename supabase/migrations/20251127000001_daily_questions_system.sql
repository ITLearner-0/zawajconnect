-- Migration: Daily Questions System (Question du Jour)
-- Created: 2025-11-27
-- Description: Système de questions quotidiennes pour favoriser des conversations profondes

-- =====================================================
-- TABLE: daily_questions
-- Stocke toutes les questions quotidiennes disponibles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  question_text TEXT NOT NULL,
  question_fr TEXT NOT NULL, -- Version française
  category TEXT NOT NULL CHECK (category IN (
    'religion', -- Foi, pratique religieuse
    'family', -- Famille, enfants, éducation
    'values', -- Valeurs personnelles, principes
    'lifestyle', -- Mode de vie, quotidien
    'goals', -- Objectifs, ambitions
    'relationship', -- Relations, communication
    'personality', -- Personnalité, caractère
    'finance', -- Finances, travail
    'culture', -- Culture, traditions
    'fun' -- Détente, loisirs
  )),
  subcategory TEXT, -- Ex: 'prayer', 'parenting', 'career'

  -- Metadata
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'deep')),
  question_type TEXT CHECK (question_type IN (
    'open_ended', -- Question ouverte
    'choice', -- Choix multiples
    'scale', -- Échelle (1-10)
    'yes_no' -- Oui/Non
  )) DEFAULT 'open_ended',

  -- Options for multiple choice questions
  choices JSONB, -- Array of choices for 'choice' type

  -- Scheduling
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher = more likely to be selected
  used_count INTEGER DEFAULT 0, -- Nombre de fois utilisée
  last_used_at TIMESTAMPTZ,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Engagement metrics
  average_response_length INTEGER,
  skip_rate DECIMAL(5,2), -- Pourcentage de skip

  -- Admin
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_questions_category ON public.daily_questions(category);
CREATE INDEX idx_daily_questions_active ON public.daily_questions(is_active) WHERE is_active = true;
CREATE INDEX idx_daily_questions_priority ON public.daily_questions(priority DESC);
CREATE INDEX idx_daily_questions_last_used ON public.daily_questions(last_used_at NULLS FIRST);
CREATE INDEX idx_daily_questions_tags ON public.daily_questions USING gin(tags);

-- Enable RLS
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read active questions
CREATE POLICY "Anyone can view active questions"
  ON public.daily_questions
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage questions"
  ON public.daily_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- TABLE: user_daily_answers
-- Stocke les réponses des utilisateurs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_daily_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,

  -- Answer data
  answer_text TEXT NOT NULL,
  answer_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Metadata
  time_to_answer_seconds INTEGER, -- Temps de réflexion
  is_skipped BOOLEAN DEFAULT false,

  -- Visibility
  is_public BOOLEAN DEFAULT true, -- Visible aux matches
  is_highlighted BOOLEAN DEFAULT false, -- Épinglée sur profil

  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, question_id)
);

-- Indexes
CREATE INDEX idx_user_daily_answers_user ON public.user_daily_answers(user_id);
CREATE INDEX idx_user_daily_answers_question ON public.user_daily_answers(question_id);
CREATE INDEX idx_user_daily_answers_date ON public.user_daily_answers(answer_date DESC);
CREATE INDEX idx_user_daily_answers_public ON public.user_daily_answers(is_public) WHERE is_public = true;
CREATE INDEX idx_user_daily_answers_user_date ON public.user_daily_answers(user_id, answer_date DESC);

-- Enable RLS
ALTER TABLE public.user_daily_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own answers
CREATE POLICY "Users can view own answers"
  ON public.user_daily_answers
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can view public answers of their matches
CREATE POLICY "Users can view matches' public answers"
  ON public.user_daily_answers
  FOR SELECT
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.is_mutual = true
      AND (
        (matches.user1_id = auth.uid() AND matches.user2_id = user_daily_answers.user_id)
        OR (matches.user2_id = auth.uid() AND matches.user1_id = user_daily_answers.user_id)
      )
    )
  );

-- Users can insert their own answers
CREATE POLICY "Users can create own answers"
  ON public.user_daily_answers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own answers
CREATE POLICY "Users can update own answers"
  ON public.user_daily_answers
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own answers
CREATE POLICY "Users can delete own answers"
  ON public.user_daily_answers
  FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- TABLE: daily_question_schedule
-- Planning des questions quotidiennes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_question_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,

  -- Schedule
  scheduled_date DATE NOT NULL UNIQUE,

  -- Status
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,

  -- Stats
  total_responses INTEGER DEFAULT 0,
  total_skips INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_question_schedule_date ON public.daily_question_schedule(scheduled_date DESC);
CREATE INDEX idx_daily_question_schedule_sent ON public.daily_question_schedule(is_sent);

-- Enable RLS
ALTER TABLE public.daily_question_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view today's and past questions
CREATE POLICY "Anyone can view scheduled questions"
  ON public.daily_question_schedule
  FOR SELECT
  USING (scheduled_date <= CURRENT_DATE);

-- Only admins can manage schedule
CREATE POLICY "Admins can manage schedule"
  ON public.daily_question_schedule
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- TABLE: answer_likes
-- Likes sur les réponses
-- =====================================================
CREATE TABLE IF NOT EXISTS public.answer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  answer_id UUID NOT NULL REFERENCES public.user_daily_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(answer_id, user_id)
);

-- Indexes
CREATE INDEX idx_answer_likes_answer ON public.answer_likes(answer_id);
CREATE INDEX idx_answer_likes_user ON public.answer_likes(user_id);

-- Enable RLS
ALTER TABLE public.answer_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all likes"
  ON public.answer_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like answers"
  ON public.answer_likes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their likes"
  ON public.answer_likes
  FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTION: get_today_question
-- Récupère la question du jour
-- =====================================================
CREATE OR REPLACE FUNCTION get_today_question()
RETURNS TABLE (
  question_id UUID,
  question_text TEXT,
  question_fr TEXT,
  category TEXT,
  question_type TEXT,
  choices JSONB,
  has_answered BOOLEAN,
  user_answer TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dq.id,
    dq.question_text,
    dq.question_fr,
    dq.category,
    dq.question_type,
    dq.choices,
    EXISTS(
      SELECT 1 FROM user_daily_answers uda
      WHERE uda.user_id = auth.uid()
      AND uda.question_id = dq.id
      AND uda.answer_date = CURRENT_DATE
    ) as has_answered,
    (
      SELECT uda.answer_text FROM user_daily_answers uda
      WHERE uda.user_id = auth.uid()
      AND uda.question_id = dq.id
      AND uda.answer_date = CURRENT_DATE
      LIMIT 1
    ) as user_answer
  FROM daily_questions dq
  INNER JOIN daily_question_schedule dqs ON dqs.question_id = dq.id
  WHERE dqs.scheduled_date = CURRENT_DATE
  AND dq.is_active = true
  LIMIT 1;
END;
$$;

-- =====================================================
-- FUNCTION: get_user_answer_streak
-- Calcule la série de réponses consécutives
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_answer_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_answer BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_daily_answers
      WHERE user_id = p_user_id
      AND answer_date = v_check_date
      AND is_skipped = false
    ) INTO v_has_answer;

    IF NOT v_has_answer THEN
      EXIT;
    END IF;

    v_streak := v_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';

    -- Max 365 days
    IF v_streak >= 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$;

-- =====================================================
-- FUNCTION: update_question_stats
-- Mise à jour des stats après réponse
-- =====================================================
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update question usage count
  UPDATE daily_questions
  SET used_count = used_count + 1,
      last_used_at = NOW()
  WHERE id = NEW.question_id;

  -- Update schedule stats
  UPDATE daily_question_schedule
  SET total_responses = total_responses + 1,
      total_skips = CASE WHEN NEW.is_skipped THEN total_skips + 1 ELSE total_skips END
  WHERE question_id = NEW.question_id
  AND scheduled_date = NEW.answer_date;

  RETURN NEW;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_question_stats ON user_daily_answers;
CREATE TRIGGER trigger_update_question_stats
  AFTER INSERT ON user_daily_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_stats();

-- =====================================================
-- FUNCTION: update_answer_likes_count
-- Mise à jour du nombre de likes
-- =====================================================
CREATE OR REPLACE FUNCTION update_answer_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_daily_answers
    SET likes_count = likes_count + 1
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_daily_answers
    SET likes_count = likes_count - 1
    WHERE id = OLD.answer_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_answer_likes_count ON answer_likes;
CREATE TRIGGER trigger_update_answer_likes_count
  AFTER INSERT OR DELETE ON answer_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_likes_count();

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT ON public.daily_questions TO authenticated;
GRANT SELECT ON public.daily_question_schedule TO authenticated;
GRANT ALL ON public.user_daily_answers TO authenticated;
GRANT ALL ON public.answer_likes TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_today_question() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_answer_streak(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.daily_questions IS 'Bibliothèque de questions quotidiennes pour encourager conversations profondes';
COMMENT ON TABLE public.user_daily_answers IS 'Réponses des utilisateurs aux questions quotidiennes';
COMMENT ON TABLE public.daily_question_schedule IS 'Planning des questions quotidiennes';
COMMENT ON TABLE public.answer_likes IS 'Likes sur les réponses aux questions';
COMMENT ON FUNCTION get_today_question() IS 'Récupère la question du jour pour l''utilisateur connecté';
COMMENT ON FUNCTION get_user_answer_streak(UUID) IS 'Calcule le nombre de jours consécutifs de réponses';
