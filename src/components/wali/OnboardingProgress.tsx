import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Video,
  FileText,
  Users,
  Trophy,
} from 'lucide-react';
import {
  OnboardingService,
  OnboardingModule,
  WaliOnboardingProgress,
} from '@/services/wali/onboardingService';
import { useToast } from '@/hooks/use-toast';

interface OnboardingProgressProps {
  wali_id: string;
  onModuleComplete?: () => void;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ wali_id, onModuleComplete }) => {
  const { toast } = useToast();
  const [modules, setModules] = useState<OnboardingModule[]>([]);
  const [progress, setProgress] = useState<WaliOnboardingProgress[]>([]);
  const [selectedModule, setSelectedModule] = useState<OnboardingModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingData();
  }, [wali_id]);

  const loadOnboardingData = async () => {
    setLoading(true);
    try {
      const modulesList = OnboardingService.getModules();
      const progressList = await OnboardingService.getProgress(wali_id);

      setModules(modulesList);
      setProgress(progressList);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de formation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string): WaliOnboardingProgress | undefined => {
    return progress.find((p) => p.module_id === moduleId);
  };

  const getModuleIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'interactive':
        return <Users className="h-4 w-4" />;
      case 'quiz':
        return <Trophy className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">Non commencé</Badge>;
    }
  };

  const startModule = async (module: OnboardingModule) => {
    try {
      await OnboardingService.updateProgress(wali_id, module.id, 'in_progress', 0);
      setSelectedModule(module);

      // Update local progress
      setProgress((prev) =>
        prev.map((p) =>
          p.module_id === module.id
            ? { ...p, status: 'in_progress', started_at: new Date().toISOString() }
            : p
        )
      );
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer le module',
        variant: 'destructive',
      });
    }
  };

  const completeModule = async (module: OnboardingModule, quizScore?: number) => {
    try {
      await OnboardingService.updateProgress(wali_id, module.id, 'completed', 100, quizScore);

      setProgress((prev) =>
        prev.map((p) =>
          p.module_id === module.id
            ? {
                ...p,
                status: 'completed',
                progress_percentage: 100,
                completed_at: new Date().toISOString(),
                quiz_score: quizScore,
              }
            : p
        )
      );

      toast({
        title: 'Module terminé',
        description: `Félicitations! Vous avez terminé "${module.title}"`,
      });

      setSelectedModule(null);
      onModuleComplete?.();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le module comme terminé',
        variant: 'destructive',
      });
    }
  };

  const overallProgress = OnboardingService.calculateOverallProgress(progress);
  const isComplete = OnboardingService.isOnboardingComplete(progress);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement de la formation...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedModule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getModuleIcon(selectedModule.content_type)}
            {selectedModule.title}
          </CardTitle>
          <p className="text-muted-foreground">{selectedModule.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedModule.content_text && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {selectedModule.content_text}
              </div>
            </div>
          )}

          {selectedModule.quiz_questions && (
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                Ce module inclut un quiz pour valider vos connaissances.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setSelectedModule(null)} variant="outline">
              Retour
            </Button>
            <Button
              onClick={() =>
                completeModule(selectedModule, selectedModule.quiz_questions ? 85 : undefined)
              }
            >
              Marquer comme Terminé
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Formation Wali - Progression Générale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />

          {isComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                Félicitations! Vous avez terminé la formation complète de wali.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((module) => {
          const moduleProgress = getModuleProgress(module.id);
          const status = moduleProgress?.status || 'not_started';

          return (
            <Card key={module.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getModuleIcon(module.content_type)}
                    <div>
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {module.duration_minutes} min
                        </span>
                        {module.required && (
                          <Badge variant="outline" className="text-xs">
                            Requis
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(status)}
                    {status === 'not_started' && (
                      <Button size="sm" onClick={() => startModule(module)}>
                        <Play className="h-3 w-3 mr-1" />
                        Commencer
                      </Button>
                    )}
                    {status === 'in_progress' && (
                      <Button size="sm" onClick={() => setSelectedModule(module)}>
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Continuer
                      </Button>
                    )}
                    {status === 'completed' && moduleProgress?.quiz_score && (
                      <Badge variant="outline">Score: {moduleProgress.quiz_score}%</Badge>
                    )}
                  </div>
                </div>

                {status === 'in_progress' && moduleProgress && (
                  <div className="mt-3">
                    <Progress value={moduleProgress.progress_percentage} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
