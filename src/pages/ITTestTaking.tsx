import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Circle,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ITCertificationService } from '@/services/it-certification.service';
import type { ITTestWithDetails, ITQuestionWithChoices, ITUserAnswer } from '@/types/it-certification';

export default function ITTestTaking() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<ITTestWithDetails | null>(null);
  const [questions, setQuestions] = useState<ITQuestionWithChoices[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    if (testId) {
      loadTest();
    }
  }, [testId]);

  // Timer for exam mode
  useEffect(() => {
    if (test?.test_mode === 'EXAM' && test.duration_minutes && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [test, timeLeft]);

  const loadTest = async () => {
    if (!testId) return;

    try {
      setLoading(true);
      const testData = await ITCertificationService.getTestById(testId);
      if (!testData) {
        throw new Error('Test not found');
      }

      setTest(testData);

      // Extract questions
      const qs = testData.questions
        ?.sort((a, b) => a.question_order - b.question_order)
        .map(tq => tq.question as ITQuestionWithChoices) || [];
      setQuestions(qs);

      // Load existing answers
      const existingAnswers = await ITCertificationService.getTestAnswers(testId);
      const answerMap = new Map<string, string[]>();
      existingAnswers.forEach(a => {
        answerMap.set(a.question_id, a.selected_choices);
      });
      setAnswers(answerMap);

      // Set timer for exam mode
      if (testData.test_mode === 'EXAM' && testData.duration_minutes) {
        const elapsed = Math.floor((Date.now() - new Date(testData.started_at).getTime()) / 1000);
        const totalSeconds = testData.duration_minutes * 60;
        setTimeLeft(Math.max(0, totalSeconds - elapsed));
      }
    } catch (error) {
      console.error('Error loading test:', error);
      alert('Erreur lors du chargement du test');
      navigate('/it-certification');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = async (questionId: string, choiceId: string, isMultiple: boolean) => {
    const currentAnswers = answers.get(questionId) || [];

    let newAnswers: string[];
    if (isMultiple) {
      // Toggle choice for multiple answer
      if (currentAnswers.includes(choiceId)) {
        newAnswers = currentAnswers.filter(id => id !== choiceId);
      } else {
        newAnswers = [...currentAnswers, choiceId];
      }
    } else {
      // Single choice
      newAnswers = [choiceId];
    }

    setAnswers(new Map(answers.set(questionId, newAnswers)));

    // Auto-save answer
    if (testId && newAnswers.length > 0) {
      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await ITCertificationService.submitAnswer({
          test_id: testId,
          question_id: questionId,
          selected_choices: newAnswers,
          time_spent_seconds: timeSpent,
        });
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  const toggleFlag = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!testId) return;

    try {
      setSubmitting(true);
      await ITCertificationService.completeTest(testId);
      navigate(`/it-certification/result/${testId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Erreur lors de la soumission du test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = answers.size;
  const progress = (answeredCount / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (!test || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Test non trouvé</p>
            <Button onClick={() => navigate('/it-certification')} className="mt-4">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMultipleAnswer = currentQuestion.question_type === 'MULTIPLE_ANSWER';
  const currentAnswers = answers.get(currentQuestion.id) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer and Progress */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Question Counter */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">
                Question {currentQuestionIndex + 1} / {questions.length}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={flaggedQuestions.has(currentQuestion.id) ? 'text-orange-600' : ''}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>

            {/* Timer (Exam Mode) */}
            {test.test_mode === 'EXAM' && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className={`h-4 w-4 ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                <span className={timeLeft < 300 ? 'text-red-600' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-semibold whitespace-nowrap">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => setShowSubmitDialog(true)}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-semibold flex-shrink-0">
                      {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {currentQuestion.question_text}
                      </p>
                      {currentQuestion.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {currentQuestion.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {isMultipleAnswer && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-800">
                        Plusieurs réponses sont possibles
                      </span>
                    </div>
                  )}
                </div>

                {/* Answer Choices */}
                <div className="space-y-3">
                  {isMultipleAnswer ? (
                    // Multiple Answer (Checkboxes)
                    <div className="space-y-3">
                      {currentQuestion.choices?.map(choice => (
                        <div
                          key={choice.id}
                          className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            currentAnswers.includes(choice.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleAnswerChange(currentQuestion.id, choice.id, true)}
                        >
                          <Checkbox
                            id={choice.id}
                            checked={currentAnswers.includes(choice.id)}
                            onCheckedChange={() => handleAnswerChange(currentQuestion.id, choice.id, true)}
                          />
                          <Label htmlFor={choice.id} className="flex-1 cursor-pointer font-normal">
                            {choice.choice_text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single Answer (Radio)
                    <RadioGroup
                      value={currentAnswers[0] || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value, false)}
                    >
                      <div className="space-y-3">
                        {currentQuestion.choices?.map(choice => (
                          <div
                            key={choice.id}
                            className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                              currentAnswers.includes(choice.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleAnswerChange(currentQuestion.id, choice.id, false)}
                          >
                            <RadioGroupItem value={choice.id} id={choice.id} />
                            <Label htmlFor={choice.id} className="flex-1 cursor-pointer font-normal">
                              {choice.choice_text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Aperçu des Questions</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers.has(q.id);
                    const isFlagged = flaggedQuestions.has(q.id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`relative h-10 rounded-lg border-2 font-semibold text-sm transition-all ${
                          isCurrent
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isAnswered
                            ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-orange-500 text-orange-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Répondu ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <span>Non répondu ({questions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-600" />
                    <span>Marqué ({flaggedQuestions.size})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soumettre le test ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez répondu à {answeredCount} sur {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-amber-600 font-semibold">
                  ⚠️ Il reste {questions.length - answeredCount} question(s) sans réponse.
                </span>
              )}
              <span className="block mt-2">
                Une fois soumis, vous ne pourrez plus modifier vos réponses.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitTest}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Soumission...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
