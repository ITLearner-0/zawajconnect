-- IT Certification Test Application Tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Certifications table (AWS, Azure, CompTIA, etc.)
CREATE TABLE IF NOT EXISTS it_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- e.g., "AWS Solutions Architect", "CompTIA A+", etc.
  code TEXT NOT NULL UNIQUE, -- e.g., "AWS-SAA", "COMPTIA-A+", etc.
  description TEXT,
  icon_url TEXT,
  total_questions INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70, -- percentage
  exam_duration INTEGER DEFAULT 90, -- minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDF documents uploaded for each certification
CREATE TABLE IF NOT EXISTS it_certification_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certification_id UUID REFERENCES it_certifications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size INTEGER,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  questions_extracted INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions extracted from PDFs
CREATE TABLE IF NOT EXISTS it_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certification_id UUID REFERENCES it_certifications(id) ON DELETE CASCADE,
  pdf_id UUID REFERENCES it_certification_pdfs(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('MCQ', 'TRUE_FALSE', 'YES_NO', 'MULTIPLE_ANSWER')),
  explanation TEXT, -- Explanation of the correct answer
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  category TEXT, -- e.g., "Networking", "Security", "Cloud Architecture", etc.
  is_active BOOLEAN DEFAULT true,
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answer choices for each question
CREATE TABLE IF NOT EXISTS it_question_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES it_questions(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  choice_order INTEGER, -- A=1, B=2, C=3, D=4, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests created by users
CREATE TABLE IF NOT EXISTS it_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES it_certifications(id) ON DELETE CASCADE,
  test_name TEXT,
  test_mode TEXT CHECK (test_mode IN ('PRACTICE', 'EXAM', 'REVIEW')), -- Practice (no timer), Exam (with timer), Review (incorrect answers)
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER, -- NULL for practice mode
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  score DECIMAL(5,2), -- percentage
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions included in each test
CREATE TABLE IF NOT EXISTS it_test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES it_tests(id) ON DELETE CASCADE,
  question_id UUID REFERENCES it_questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, question_id)
);

-- User answers for each test
CREATE TABLE IF NOT EXISTS it_user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES it_tests(id) ON DELETE CASCADE,
  question_id UUID REFERENCES it_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_choices UUID[], -- Array of choice IDs (for multiple answer questions)
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER, -- Time spent on this question
  UNIQUE(test_id, question_id, user_id)
);

-- User progress tracking per certification
CREATE TABLE IF NOT EXISTS it_user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES it_certifications(id) ON DELETE CASCADE,
  total_tests_taken INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  best_score DECIMAL(5,2) DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  last_test_date TIMESTAMPTZ,
  study_streak_days INTEGER DEFAULT 0, -- Consecutive days of study
  last_study_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, certification_id)
);

-- Test results summary
CREATE TABLE IF NOT EXISTS it_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES it_tests(id) ON DELETE CASCADE UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES it_certifications(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_minutes INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_it_questions_certification ON it_questions(certification_id);
CREATE INDEX idx_it_questions_type ON it_questions(question_type);
CREATE INDEX idx_it_questions_active ON it_questions(is_active);
CREATE INDEX idx_it_question_choices_question ON it_question_choices(question_id);
CREATE INDEX idx_it_tests_user ON it_tests(user_id);
CREATE INDEX idx_it_tests_certification ON it_tests(certification_id);
CREATE INDEX idx_it_test_questions_test ON it_test_questions(test_id);
CREATE INDEX idx_it_user_answers_test ON it_user_answers(test_id);
CREATE INDEX idx_it_user_answers_user ON it_user_answers(user_id);
CREATE INDEX idx_it_user_progress_user ON it_user_progress(user_id);
CREATE INDEX idx_it_test_results_user ON it_test_results(user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_it_certifications_updated_at BEFORE UPDATE ON it_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_it_questions_updated_at BEFORE UPDATE ON it_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_it_user_progress_updated_at BEFORE UPDATE ON it_user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update certification question count
CREATE OR REPLACE FUNCTION update_certification_question_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE it_certifications
  SET total_questions = (
    SELECT COUNT(*)
    FROM it_questions
    WHERE certification_id = COALESCE(NEW.certification_id, OLD.certification_id)
    AND is_active = true
  )
  WHERE id = COALESCE(NEW.certification_id, OLD.certification_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_certification_count_on_question_change
AFTER INSERT OR UPDATE OR DELETE ON it_questions
FOR EACH ROW EXECUTE FUNCTION update_certification_question_count();

-- Function to update user progress after test completion
CREATE OR REPLACE FUNCTION update_user_progress_on_test_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    INSERT INTO it_user_progress (
      user_id,
      certification_id,
      total_tests_taken,
      total_questions_answered,
      total_correct_answers,
      best_score,
      average_score,
      last_test_date,
      last_study_date
    )
    VALUES (
      NEW.user_id,
      NEW.certification_id,
      1,
      NEW.total_questions,
      NEW.correct_answers,
      NEW.score,
      NEW.score,
      NEW.completed_at,
      CURRENT_DATE
    )
    ON CONFLICT (user_id, certification_id)
    DO UPDATE SET
      total_tests_taken = it_user_progress.total_tests_taken + 1,
      total_questions_answered = it_user_progress.total_questions_answered + NEW.total_questions,
      total_correct_answers = it_user_progress.total_correct_answers + NEW.correct_answers,
      best_score = GREATEST(it_user_progress.best_score, NEW.score),
      average_score = (
        (it_user_progress.average_score * it_user_progress.total_tests_taken + NEW.score) /
        (it_user_progress.total_tests_taken + 1)
      ),
      last_test_date = NEW.completed_at,
      last_study_date = CURRENT_DATE,
      study_streak_days = CASE
        WHEN it_user_progress.last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN it_user_progress.study_streak_days + 1
        WHEN it_user_progress.last_study_date = CURRENT_DATE THEN it_user_progress.study_streak_days
        ELSE 1
      END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_on_test_complete
AFTER UPDATE ON it_tests
FOR EACH ROW EXECUTE FUNCTION update_user_progress_on_test_complete();

-- Function to update question statistics
CREATE OR REPLACE FUNCTION update_question_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE it_questions
  SET
    times_answered = times_answered + 1,
    times_correct = times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_stats_on_answer
AFTER INSERT ON it_user_answers
FOR EACH ROW EXECUTE FUNCTION update_question_statistics();
