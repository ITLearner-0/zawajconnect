// Service for IT Certification Test Application

import { supabase } from '@/integrations/supabase/client';
import type {
  ITCertification,
  ITCertificationPDF,
  ITQuestion,
  ITQuestionChoice,
  ITTest,
  ITTestQuestion,
  ITUserAnswer,
  ITUserProgress,
  ITTestResult,
  CreateTestRequest,
  SubmitAnswerRequest,
  ITQuestionWithChoices,
  ITTestWithDetails,
} from '@/types/it-certification';

export class ITCertificationService {
  // ============================================
  // CERTIFICATIONS
  // ============================================

  static async getAllCertifications(): Promise<ITCertification[]> {
    const { data, error } = await supabase
      .from('it_certifications')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getCertificationById(id: string): Promise<ITCertification | null> {
    const { data, error } = await supabase
      .from('it_certifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // QUESTIONS
  // ============================================

  static async getQuestionsByCertification(
    certificationId: string,
    limit?: number,
    categories?: string[],
    difficulty?: string
  ): Promise<ITQuestionWithChoices[]> {
    let query = supabase
      .from('it_questions')
      .select(`
        *,
        choices:it_question_choices(*)
      `)
      .eq('certification_id', certificationId)
      .eq('is_active', true);

    if (categories && categories.length > 0) {
      query = query.in('category', categories);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as ITQuestionWithChoices[];
  }

  static async getQuestionById(questionId: string): Promise<ITQuestionWithChoices | null> {
    const { data, error } = await supabase
      .from('it_questions')
      .select(`
        *,
        choices:it_question_choices(*)
      `)
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return data as ITQuestionWithChoices;
  }

  static async getRandomQuestions(
    certificationId: string,
    count: number,
    categories?: string[],
    difficulty?: string
  ): Promise<ITQuestionWithChoices[]> {
    // Get all matching questions first
    const questions = await this.getQuestionsByCertification(
      certificationId,
      undefined,
      categories,
      difficulty
    );

    // Shuffle and return requested count
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  static async getQuestionCategories(certificationId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('it_questions')
      .select('category')
      .eq('certification_id', certificationId)
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data?.map(q => q.category).filter(Boolean) || [])];
    return categories as string[];
  }

  // ============================================
  // TESTS
  // ============================================

  static async createTest(request: CreateTestRequest): Promise<ITTest> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    // Create test record
    const { data: test, error: testError } = await supabase
      .from('it_tests')
      .insert({
        user_id: userData.user.id,
        certification_id: request.certification_id,
        test_mode: request.test_mode,
        total_questions: request.total_questions,
        duration_minutes: request.duration_minutes,
        is_completed: false,
        correct_answers: 0,
        incorrect_answers: 0,
        unanswered: request.total_questions,
      })
      .select()
      .single();

    if (testError) throw testError;

    // Get random questions
    const questions = await this.getRandomQuestions(
      request.certification_id,
      request.total_questions,
      request.categories,
      request.difficulty
    );

    // Insert test questions
    const testQuestions = questions.map((q, index) => ({
      test_id: test.id,
      question_id: q.id,
      question_order: index + 1,
    }));

    const { error: questionsError } = await supabase
      .from('it_test_questions')
      .insert(testQuestions);

    if (questionsError) throw questionsError;

    return test;
  }

  static async getTestById(testId: string): Promise<ITTestWithDetails | null> {
    const { data, error } = await supabase
      .from('it_tests')
      .select(`
        *,
        certification:it_certifications(*),
        questions:it_test_questions(
          *,
          question:it_questions(
            *,
            choices:it_question_choices(*)
          )
        ),
        result:it_test_results(*)
      `)
      .eq('id', testId)
      .single();

    if (error) throw error;
    return data as ITTestWithDetails;
  }

  static async getUserTests(userId?: string, limit: number = 10): Promise<ITTest[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const uid = userId || userData.user.id;

    const { data, error } = await supabase
      .from('it_tests')
      .select('*, certification:it_certifications(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async completeTest(testId: string): Promise<ITTestResult> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    // Get test with all answers
    const { data: test, error: testError } = await supabase
      .from('it_tests')
      .select(`
        *,
        answers:it_user_answers(*)
      `)
      .eq('id', testId)
      .single();

    if (testError) throw testError;

    // Calculate score
    const correctAnswers = test.answers?.filter((a: ITUserAnswer) => a.is_correct).length || 0;
    const totalQuestions = test.total_questions;
    const score = (correctAnswers / totalQuestions) * 100;

    // Get certification passing score
    const { data: certification } = await supabase
      .from('it_certifications')
      .select('passing_score')
      .eq('id', test.certification_id)
      .single();

    const passed = score >= (certification?.passing_score || 70);

    // Calculate time taken
    const startTime = new Date(test.started_at).getTime();
    const endTime = Date.now();
    const timeTakenMinutes = Math.round((endTime - startTime) / 1000 / 60);

    // Update test
    const { error: updateError } = await supabase
      .from('it_tests')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        score,
        correct_answers: correctAnswers,
        incorrect_answers: totalQuestions - correctAnswers - test.unanswered,
      })
      .eq('id', testId);

    if (updateError) throw updateError;

    // Create test result
    const { data: result, error: resultError } = await supabase
      .from('it_test_results')
      .insert({
        test_id: testId,
        user_id: userData.user.id,
        certification_id: test.certification_id,
        score,
        passed,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_taken_minutes: timeTakenMinutes,
      })
      .select()
      .single();

    if (resultError) throw resultError;

    return result;
  }

  // ============================================
  // ANSWERS
  // ============================================

  static async submitAnswer(request: SubmitAnswerRequest): Promise<ITUserAnswer> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    // Get question with choices to check correctness
    const question = await this.getQuestionById(request.question_id);
    if (!question) throw new Error('Question not found');

    // Determine if answer is correct
    const correctChoices = question.choices
      .filter(c => c.is_correct)
      .map(c => c.id)
      .sort();
    const selectedChoices = [...request.selected_choices].sort();
    const isCorrect =
      correctChoices.length === selectedChoices.length &&
      correctChoices.every((id, index) => id === selectedChoices[index]);

    // Insert or update answer
    const { data, error } = await supabase
      .from('it_user_answers')
      .upsert({
        test_id: request.test_id,
        question_id: request.question_id,
        user_id: userData.user.id,
        selected_choices: request.selected_choices,
        is_correct: isCorrect,
        time_spent_seconds: request.time_spent_seconds,
        answered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update test unanswered count
    const { data: testAnswers } = await supabase
      .from('it_user_answers')
      .select('id')
      .eq('test_id', request.test_id);

    const { data: test } = await supabase
      .from('it_tests')
      .select('total_questions')
      .eq('id', request.test_id)
      .single();

    if (test && testAnswers) {
      await supabase
        .from('it_tests')
        .update({
          unanswered: test.total_questions - testAnswers.length,
        })
        .eq('id', request.test_id);
    }

    return data;
  }

  static async getTestAnswers(testId: string): Promise<ITUserAnswer[]> {
    const { data, error } = await supabase
      .from('it_user_answers')
      .select('*')
      .eq('test_id', testId)
      .order('answered_at');

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // USER PROGRESS
  // ============================================

  static async getUserProgress(certificationId: string): Promise<ITUserProgress | null> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('it_user_progress')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('certification_id', certificationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  static async getAllUserProgress(): Promise<ITUserProgress[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('it_user_progress')
      .select('*, certification:it_certifications(*)')
      .eq('user_id', userData.user.id)
      .order('last_test_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // TEST RESULTS
  // ============================================

  static async getTestResult(testId: string): Promise<ITTestResult | null> {
    const { data, error } = await supabase
      .from('it_test_results')
      .select('*, certification:it_certifications(*), test:it_tests(*)')
      .eq('test_id', testId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getUserResults(limit: number = 10): Promise<ITTestResult[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('it_test_results')
      .select('*, certification:it_certifications(*)')
      .eq('user_id', userData.user.id)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // ADMIN - PDF MANAGEMENT
  // ============================================

  static async uploadPDF(
    certificationId: string,
    file: File
  ): Promise<ITCertificationPDF> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('User not authenticated');

    // Upload file to storage
    const fileName = `${certificationId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('it-certification-pdfs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create PDF record
    const { data, error } = await supabase
      .from('it_certification_pdfs')
      .insert({
        certification_id: certificationId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        uploaded_by: userData.user.id,
        processed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getPDFsByCertification(certificationId: string): Promise<ITCertificationPDF[]> {
    const { data, error } = await supabase
      .from('it_certification_pdfs')
      .select('*')
      .eq('certification_id', certificationId)
      .order('upload_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // ADMIN - QUESTION MANAGEMENT
  // ============================================

  static async createQuestion(
    question: Omit<ITQuestion, 'id' | 'created_at' | 'updated_at' | 'times_answered' | 'times_correct'>,
    choices: Omit<ITQuestionChoice, 'id' | 'question_id' | 'created_at'>[]
  ): Promise<ITQuestion> {
    const { data: questionData, error: questionError } = await supabase
      .from('it_questions')
      .insert(question)
      .select()
      .single();

    if (questionError) throw questionError;

    const choicesWithQuestionId = choices.map(c => ({
      ...c,
      question_id: questionData.id,
    }));

    const { error: choicesError } = await supabase
      .from('it_question_choices')
      .insert(choicesWithQuestionId);

    if (choicesError) throw choicesError;

    return questionData;
  }

  static async updateQuestion(
    questionId: string,
    updates: Partial<ITQuestion>
  ): Promise<ITQuestion> {
    const { data, error } = await supabase
      .from('it_questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase
      .from('it_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
  }
}
