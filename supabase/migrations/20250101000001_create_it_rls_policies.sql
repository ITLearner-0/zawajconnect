-- Row Level Security Policies for IT Certification App

-- Enable RLS on all tables
ALTER TABLE it_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_certification_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_question_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_test_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- IT CERTIFICATIONS POLICIES (public read)
-- ============================================

-- Everyone can view active certifications
CREATE POLICY "Anyone can view active certifications"
  ON it_certifications FOR SELECT
  USING (is_active = true);

-- Only admins can insert certifications
CREATE POLICY "Admins can insert certifications"
  ON it_certifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update certifications
CREATE POLICY "Admins can update certifications"
  ON it_certifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete certifications
CREATE POLICY "Admins can delete certifications"
  ON it_certifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- IT CERTIFICATION PDFs POLICIES
-- ============================================

-- Admins can view all PDFs
CREATE POLICY "Admins can view all PDFs"
  ON it_certification_pdfs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert PDFs
CREATE POLICY "Admins can insert PDFs"
  ON it_certification_pdfs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update PDFs
CREATE POLICY "Admins can update PDFs"
  ON it_certification_pdfs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete PDFs
CREATE POLICY "Admins can delete PDFs"
  ON it_certification_pdfs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- IT QUESTIONS POLICIES
-- ============================================

-- Users can view active questions
CREATE POLICY "Users can view active questions"
  ON it_questions FOR SELECT
  USING (is_active = true);

-- Admins can view all questions
CREATE POLICY "Admins can view all questions"
  ON it_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert questions
CREATE POLICY "Admins can insert questions"
  ON it_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update questions
CREATE POLICY "Admins can update questions"
  ON it_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete questions
CREATE POLICY "Admins can delete questions"
  ON it_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- IT QUESTION CHOICES POLICIES
-- ============================================

-- Users can view choices for active questions
CREATE POLICY "Users can view question choices"
  ON it_question_choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM it_questions
      WHERE id = question_id
      AND is_active = true
    )
  );

-- Admins can view all choices
CREATE POLICY "Admins can view all choices"
  ON it_question_choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert choices
CREATE POLICY "Admins can insert choices"
  ON it_question_choices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update choices
CREATE POLICY "Admins can update choices"
  ON it_question_choices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete choices
CREATE POLICY "Admins can delete choices"
  ON it_question_choices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- IT TESTS POLICIES (user owns their tests)
-- ============================================

-- Users can view their own tests
CREATE POLICY "Users can view their own tests"
  ON it_tests FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all tests
CREATE POLICY "Admins can view all tests"
  ON it_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Users can create their own tests
CREATE POLICY "Users can create tests"
  ON it_tests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own tests
CREATE POLICY "Users can update their own tests"
  ON it_tests FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own tests
CREATE POLICY "Users can delete their own tests"
  ON it_tests FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- IT TEST QUESTIONS POLICIES
-- ============================================

-- Users can view questions in their tests
CREATE POLICY "Users can view test questions"
  ON it_test_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM it_tests
      WHERE id = test_id
      AND user_id = auth.uid()
    )
  );

-- Users can add questions to their tests
CREATE POLICY "Users can add test questions"
  ON it_test_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM it_tests
      WHERE id = test_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- IT USER ANSWERS POLICIES
-- ============================================

-- Users can view their own answers
CREATE POLICY "Users can view their own answers"
  ON it_user_answers FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own answers
CREATE POLICY "Users can insert their own answers"
  ON it_user_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own answers (for practice mode)
CREATE POLICY "Users can update their own answers"
  ON it_user_answers FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- IT USER PROGRESS POLICIES
-- ============================================

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
  ON it_user_progress FOR SELECT
  USING (user_id = auth.uid());

-- System can insert/update progress (via triggers)
CREATE POLICY "System can manage user progress"
  ON it_user_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- IT TEST RESULTS POLICIES
-- ============================================

-- Users can view their own test results
CREATE POLICY "Users can view their own results"
  ON it_test_results FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all results
CREATE POLICY "Admins can view all results"
  ON it_test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- System can insert results
CREATE POLICY "Users can insert their own results"
  ON it_test_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
