import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Trophy,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Home,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ITCertificationService } from '@/services/it-certification.service';
import type {
  ITTestResult as TestResult,
  ITTestWithDetails,
  ITUserAnswer,
  ITQuestionWithChoices,
} from '@/types/it-certification';

export default function ITTestResult() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<TestResult | null>(null);
  const [test, setTest] = useState<ITTestWithDetails | null>(null);
  const [answers, setAnswers] = useState<ITUserAnswer[]>([]);
  const [questions, setQuestions] = useState<ITQuestionWithChoices[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (testId) {
      loadResults();
    }
  }, [testId]);

  const loadResults = async () => {
    if (!testId) return;

    try {
      setLoading(true);
      const [resultData, testData, answersData] = await Promise.all([
        ITCertificationService.getTestResult(testId),
        ITCertificationService.getTestById(testId),
        ITCertificationService.getTestAnswers(testId),
      ]);

      setResult(resultData);
      setTest(testData);
      setAnswers(answersData);

      if (testData?.questions) {
        const qs = testData.questions
          .sort((a, b) => a.question_order - b.question_order)
          .map(tq => tq.question as ITQuestionWithChoices);
        setQuestions(qs);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    setExpandedQuestions(new Set(questions.map(q => q.id)));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (!result || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Résultats non trouvés</p>
            <Button onClick={() => navigate('/it-certification')} className="mt-4">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passingScore = test.certification?.passing_score || 70;
  const isPassed = result.passed;
  const scorePercentage = result.score;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Results Header */}
        <Card className={`mb-6 ${isPassed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'}`}>
          <CardContent className="p-8">
            <div className="text-center">
              {isPassed ? (
                <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {isPassed ? 'Félicitations ! 🎉' : 'Test Terminé'}
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                {isPassed
                  ? `Vous avez réussi le test avec un score de ${scorePercentage.toFixed(1)}%`
                  : `Vous avez obtenu ${scorePercentage.toFixed(1)}% (minimum requis: ${passingScore}%)`}
              </p>

              {/* Score Visualization */}
              <div className="max-w-md mx-auto mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Score</span>
                  <span className="text-2xl font-bold">{scorePercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={scorePercentage}
                  className="h-4"
                  indicatorClassName={isPassed ? 'bg-green-600' : 'bg-red-600'}
                />
                <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                  <span>0%</span>
                  <span className="font-semibold">Seuil: {passingScore}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {result.correct_answers}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Correctes</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">
                      {result.total_questions - result.correct_answers}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Incorrectes</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {result.total_questions}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {result.time_taken_minutes || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => navigate('/it-certification')} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
          <Button onClick={() => navigate('/it-certification/dashboard')} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tableau de Bord
          </Button>
          <Button
            onClick={() => navigate(`/it-certification/test/select/${test.certification_id}`)}
            variant="default"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Nouveau Test
          </Button>
        </div>

        {/* Detailed Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Révision Détaillée</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Tout Ouvrir
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Tout Fermer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers.find(a => a.question_id === question.id);
                const isCorrect = userAnswer?.is_correct || false;
                const isExpanded = expandedQuestions.has(question.id);

                return (
                  <Collapsible
                    key={question.id}
                    open={isExpanded}
                    onOpenChange={() => toggleQuestion(question.id)}
                  >
                    <Card
                      className={`${
                        isCorrect
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-red-200 bg-red-50/50'
                      }`}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="p-4 flex items-start gap-3 text-left">
                          {isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">Question {index + 1}</span>
                              {question.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {question.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700">{question.question_text}</p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3">
                          {question.choices?.map(choice => {
                            const isSelected = userAnswer?.selected_choices.includes(choice.id);
                            const isCorrectChoice = choice.is_correct;

                            return (
                              <div
                                key={choice.id}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectChoice
                                    ? 'border-green-500 bg-green-50'
                                    : isSelected
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {isCorrectChoice ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  ) : isSelected ? (
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <div className="h-5 w-5" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-gray-900">{choice.choice_text}</p>
                                    {isSelected && !isCorrectChoice && (
                                      <p className="text-xs text-red-600 mt-1">
                                        Votre réponse
                                      </p>
                                    )}
                                    {isCorrectChoice && (
                                      <p className="text-xs text-green-600 mt-1 font-semibold">
                                        Réponse correcte
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {question.explanation && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Explication
                              </h4>
                              <p className="text-sm text-blue-800">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
