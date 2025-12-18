import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, TrendingUp, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ITCertificationService } from '@/services/it-certification.service';
import type { ITCertification, ITUserProgress } from '@/types/it-certification';

export default function ITCertificationHome() {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<ITCertification[]>([]);
  const [progress, setProgress] = useState<ITUserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certs, prog] = await Promise.all([
        ITCertificationService.getAllCertifications(),
        ITCertificationService.getAllUserProgress().catch(() => []),
      ]);
      setCertifications(certs);
      setProgress(prog);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForCertification = (certId: string) => {
    return progress.find(p => p.certification_id === certId);
  };

  const getCertificationIcon = (code: string) => {
    if (code.startsWith('AWS')) return '☁️';
    if (code.startsWith('AZ-')) return '🔷';
    if (code.startsWith('GCP')) return '🌐';
    if (code.startsWith('COMPTIA')) return '🖥️';
    if (code.startsWith('CCNA')) return '🔗';
    if (code.includes('KUBERNETES')) return '⚓';
    if (code.includes('CISSP')) return '🔒';
    if (code.includes('PMP')) return '📊';
    return '📚';
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
                IT Certification Tests
              </h1>
              <p className="text-gray-600 mt-2">
                Préparez-vous aux certifications IT avec des tests interactifs
              </p>
            </div>
            <Button
              onClick={() => navigate('/it-certification/dashboard')}
              variant="outline"
              className="hidden md:flex"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Mon Tableau de Bord
            </Button>
          </div>

          {/* Mobile Dashboard Button */}
          <Button
            onClick={() => navigate('/it-certification/dashboard')}
            variant="outline"
            className="w-full md:hidden"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Mon Tableau de Bord
          </Button>
        </div>

        {/* Quick Stats */}
        {progress.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certifications</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tests Passés</p>
                    <p className="text-2xl font-bold text-green-600">
                      {progress.reduce((sum, p) => sum + p.total_tests_taken, 0)}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Meilleur Score</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.max(...progress.map(p => p.best_score))}%
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Série d'Étude</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.max(...progress.map(p => p.study_streak_days))} jours
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Certifications Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Certifications Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map(cert => {
              const certProgress = getProgressForCertification(cert.id);
              return (
                <Card
                  key={cert.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/it-certification/test/select/${cert.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{getCertificationIcon(cert.code)}</div>
                      <Badge variant="secondary">{cert.code}</Badge>
                    </div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {cert.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Questions disponibles:</span>
                        <span className="font-semibold">{cert.total_questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score de passage:</span>
                        <span className="font-semibold">{cert.passing_score}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Durée d'examen:</span>
                        <span className="font-semibold">{cert.exam_duration} min</span>
                      </div>

                      {certProgress && (
                        <>
                          <div className="border-t pt-3 mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Votre progression:</span>
                              <span className="font-semibold text-blue-600">
                                {certProgress.average_score.toFixed(1)}% moy.
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Tests passés:</span>
                              <span className="font-semibold">
                                {certProgress.total_tests_taken}
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      <Button className="w-full mt-4" variant="default">
                        Commencer un Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {certifications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune certification disponible
                </h3>
                <p className="text-gray-600">
                  Les certifications seront bientôt disponibles.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
