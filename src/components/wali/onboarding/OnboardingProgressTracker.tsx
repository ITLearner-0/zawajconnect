import { useWaliOnboardingProgress } from '@/hooks/wali/useWaliOnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OnboardingStepCard } from './OnboardingStepCard';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OnboardingProgressTrackerProps {
  waliId: string;
  userId: string;
}

export const OnboardingProgressTracker = ({ waliId, userId }: OnboardingProgressTrackerProps) => {
  const { progress, loading, updateStep, initializeProgress } = useWaliOnboardingProgress(waliId);

  const steps = [
    {
      key: 'profile_completed' as keyof typeof progress,
      title: 'Profil complété',
      description: 'Remplir toutes les informations du profil Wali',
    },
    {
      key: 'verification_submitted' as keyof typeof progress,
      title: 'Vérification soumise',
      description: 'Soumettre les documents de vérification',
    },
    {
      key: 'training_completed' as keyof typeof progress,
      title: 'Formation complétée',
      description: 'Suivre et valider la formation obligatoire',
    },
    {
      key: 'agreement_signed' as keyof typeof progress,
      title: 'Accord signé',
      description: "Signer l'accord de responsabilité",
    },
  ];

  const handleStepStart = async (stepKey: keyof typeof progress) => {
    if (!progress) {
      await initializeProgress(userId);
    } else {
      await updateStep(stepKey, true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = progress?.completion_percentage || 0;
  const isComplete = progress?.status === 'completed';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progression de l'intégration</CardTitle>
              <CardDescription>
                Complétez toutes les étapes pour activer votre compte Wali
              </CardDescription>
            </div>
            {isComplete && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Complété
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression globale</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {progress?.status && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Statut:</span>
              <Badge variant={progress.status === 'completed' ? 'secondary' : 'default'}>
                {progress.status === 'not_started' && 'Non commencé'}
                {progress.status === 'in_progress' && 'En cours'}
                {progress.status === 'completed' && 'Complété'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {isComplete && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Félicitations ! Vous avez complété toutes les étapes d'intégration. Votre compte Wali
            est maintenant actif.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = Boolean(progress?.[step.key]);
          const prevStep = index > 0 ? steps[index - 1] : null;
          const previousStepCompleted =
            index === 0 || Boolean(prevStep && progress?.[prevStep.key]);
          const isCurrent = !isCompleted && previousStepCompleted;
          const isLocked = !previousStepCompleted && !isCompleted;

          return (
            <OnboardingStepCard
              key={step.key}
              title={step.title}
              description={step.description}
              completed={isCompleted}
              locked={isLocked}
              current={isCurrent}
              onStart={!isLocked ? () => handleStepStart(step.key) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};
