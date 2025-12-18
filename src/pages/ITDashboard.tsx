import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ITCertificationService } from '@/services/it-certification.service';
import type { ITUserProgress, ITTestResult, ITCertification } from '@/types/it-certification';

export default function ITDashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<(ITUserProgress & { certification?: ITCertification })[]>([]);
  const [recentResults, setRecentResults] = useState<ITTestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prog, results] = await Promise.all([
        ITCertificationService.getAllUserProgress(),
        ITCertificationService.getUserResults(20),
      ]);
      setProgress(prog as any);
      setRecentResults(results);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTests = progress.reduce((sum, p) => sum + p.total_tests_taken, 0);
  const totalQuestions = progress.reduce((sum, p) => sum + p.total_questions_answered, 0);
  const overallAccuracy = totalQuestions > 0
    ? (progress.reduce((sum, p) => sum + p.total_correct_answers, 0) / totalQuestions) * 100
    : 0;
  const maxStreak = Math.max(...progress.map(p => p.study_streak_days), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/it-certification')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            Tableau de Bord
          </h1>
          <p className="text-gray-600 mt-2">
            Suivez vos progrès et vos performances
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tests Passés</p>
                  <p className="text-3xl font-bold">{totalTests}</p>
                </div>
                <Trophy className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Précision Globale</p>
                  <p className="text-3xl font-bold">{overallAccuracy.toFixed(1)}%</p>
                </div>
                <Target className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Questions Traitées</p>
                  <p className="text-3xl font-bold">{totalQuestions}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Série d'Étude</p>
                  <p className="text-3xl font-bold">{maxStreak} jours</p>
                </div>
                <Clock className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Certification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progression par Certification</CardTitle>
            <CardDescription>
              Vos performances détaillées pour chaque certification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progress.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun test passé pour le moment</p>
                <Button
                  onClick={() => navigate('/it-certification')}
                  className="mt-4"
                >
                  Commencer un Test
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map(prog => (
                  <Card key={prog.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Certification Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {prog.certification?.name || 'Certification'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {prog.certification?.code}
                          </p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-600">Tests</p>
                              <p className="font-semibold">{prog.total_tests_taken}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Meilleur Score</p>
                              <p className="font-semibold text-green-600">
                                {prog.best_score.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Score Moyen</p>
                              <p className="font-semibold text-blue-600">
                                {prog.average_score.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Précision</p>
                              <p className="font-semibold text-purple-600">
                                {((prog.total_correct_answers / prog.total_questions_answered) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                Progression vers {prog.certification?.passing_score || 70}%
                              </span>
                              <span className="text-xs font-semibold">
                                {prog.average_score.toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(
                                (prog.average_score / (prog.certification?.passing_score || 70)) * 100,
                                100
                              )}
                              className="h-2"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/it-certification/test/select/${prog.certification_id}`)
                            }
                            className="flex-1 md:flex-none"
                          >
                            Nouveau Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Tests Récents</CardTitle>
            <CardDescription>
              Historique de vos derniers tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentResults.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun historique de test</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResults.map(result => (
                  <div
                    key={result.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/it-certification/result/${result.test_id}`)}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {result.passed ? (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold">
                          {(result as any).certification?.name || 'Test'}
                        </h4>
                        <Badge variant={result.passed ? 'default' : 'destructive'}>
                          {result.score.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {result.correct_answers}/{result.total_questions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.time_taken_minutes || 0} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(result.completed_at)}
                        </span>
                      </div>
                    </div>

                    {/* View Button */}
                    <Button variant="ghost" size="sm">
                      Voir →
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
