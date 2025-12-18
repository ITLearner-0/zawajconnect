// Types for IT Certification Test Application

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'YES_NO' | 'MULTIPLE_ANSWER';
export type TestMode = 'PRACTICE' | 'EXAM' | 'REVIEW';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ITCertification {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon_url?: string;
  total_questions: number;
  passing_score: number;
  exam_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITCertificationPDF {
  id: string;
  certification_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  processed: boolean;
  processed_at?: string;
  questions_extracted: number;
  uploaded_by: string;
  created_at: string;
}

export interface ITQuestion {
  id: string;
  certification_id: string;
  pdf_id?: string;
  question_text: string;
  question_type: QuestionType;
  explanation?: string;
  difficulty?: Difficulty;
  category?: string;
  is_active: boolean;
  times_answered: number;
  times_correct: number;
  created_at: string;
  updated_at: string;
  choices?: ITQuestionChoice[];
}

export interface ITQuestionChoice {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  choice_order: number;
  created_at: string;
}

export interface ITTest {
  id: string;
  user_id: string;
  certification_id: string;
  test_name?: string;
  test_mode: TestMode;
  total_questions: number;
  duration_minutes?: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  score?: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  created_at: string;
}

export interface ITTestQuestion {
  id: string;
  test_id: string;
  question_id: string;
  question_order: number;
  created_at: string;
}

export interface ITUserAnswer {
  id: string;
  test_id: string;
  question_id: string;
  user_id: string;
  selected_choices: string[];
  is_correct?: boolean;
  answered_at: string;
  time_spent_seconds?: number;
}

export interface ITUserProgress {
  id: string;
  user_id: string;
  certification_id: string;
  total_tests_taken: number;
  total_questions_answered: number;
  total_correct_answers: number;
  best_score: number;
  average_score: number;
  last_test_date?: string;
  study_streak_days: number;
  last_study_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ITTestResult {
  id: string;
  test_id: string;
  user_id: string;
  certification_id: string;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  time_taken_minutes?: number;
  completed_at: string;
  created_at: string;
}

// Extended types with joins
export interface ITTestWithDetails extends ITTest {
  certification?: ITCertification;
  questions?: (ITTestQuestion & { question: ITQuestion })[];
  result?: ITTestResult;
}

export interface ITQuestionWithChoices extends ITQuestion {
  choices: ITQuestionChoice[];
}

export interface ITTestResultWithDetails extends ITTestResult {
  certification?: ITCertification;
  test?: ITTest;
}

// Request/Response types
export interface CreateTestRequest {
  certification_id: string;
  test_mode: TestMode;
  total_questions: number;
  duration_minutes?: number;
  categories?: string[];
  difficulty?: Difficulty;
}

export interface SubmitAnswerRequest {
  test_id: string;
  question_id: string;
  selected_choices: string[];
  time_spent_seconds?: number;
}

export interface TestStatistics {
  total_questions: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
  time_elapsed_seconds: number;
}

export interface CertificationStats {
  certification: ITCertification;
  progress: ITUserProgress;
  recent_tests: ITTestResult[];
  category_breakdown: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
}
