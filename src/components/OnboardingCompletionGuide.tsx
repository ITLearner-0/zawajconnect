import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  User,
  Heart,
  Camera,
  Shield,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

interface CompletionStatus {
  profileComplete: boolean;
  islamicPrefsSet: boolean;
  photoUploaded: boolean;
  interestsAdded: boolean;
  compatibilityTestTaken: boolean;
  firstMessageSent: boolean;
}

const OnboardingCompletionGuide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CompletionStatus>({
    profileComplete: false,
    islamicPrefsSet: false,
    photoUploaded: false,
    interestsAdded: false,
    compatibilityTestTaken: false,
    firstMessageSent: false,
  });
  const [skippedDuringOnboarding, setSkippedDuringOnboarding] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkCompletionStatus();
      // Check for skipped sections from onboarding
      const savedData = localStorage.getItem('onboarding_progress');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setSkippedDuringOnboarding(parsed.skippedSections || []);
        } catch (e) {
          console.error('Error parsing saved onboarding data:', e);
        }
      }
    }
  }, [user]);

  const checkCompletionStatus = async () => {
    if (!user) return;

    try {
      // Check profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, age, bio, looking_for, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileComplete = !!(
        profile &&
        profile.full_name &&
        profile.age &&
        profile.bio &&
        profile.looking_for
      );
      const photoUploaded = !!(profile && profile.avatar_url);

      // Check interests
      const { data: profileWithInterests } = await supabase
        .from('profiles')
        .select('interests')
        .eq('user_id', user.id)
        .maybeSingle();

      const interestsAdded = !!(
        profileWithInterests &&
        profileWithInterests.interests &&
        profileWithInterests.interests.length > 0
      );

      // Check Islamic preferences
      const { data: islamicPrefs } = await supabase
        .from('islamic_preferences')
        .select('sect, prayer_frequency, importance_of_religion')
        .eq('user_id', user.id)
        .maybeSingle();

      const islamicPrefsSet = !!(
        islamicPrefs &&
        islamicPrefs.sect &&
        islamicPrefs.prayer_frequency
      );

      // Check compatibility test
      const { count: responseCount } = await supabase
        .from('user_compatibility_responses')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      const compatibilityTestTaken = (responseCount || 0) > 5;

      // Check if first message sent
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('sender_id', user.id);

      const firstMessageSent = (messageCount || 0) > 0;

      setStatus({
        profileComplete,
        islamicPrefsSet,
        photoUploaded,
        interestsAdded,
        compatibilityTestTaken,
        firstMessageSent,
      });
    } catch (error) {
      console.error('Error checking completion status:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      key: 'profileComplete' as keyof CompletionStatus,
      title: 'Complétez votre profil',
      description: 'Ajoutez vos informations personnelles et votre bio',
      icon: User,
      action: () => navigate('/enhanced-profile?tab=profile'),
      actionText: 'Compléter le profil',
    },
    {
      key: 'islamicPrefsSet' as keyof CompletionStatus,
      title: 'Définissez vos préférences islamiques',
      description: 'Configurez vos critères religieux pour un meilleur matching',
      icon: Heart,
      action: () => navigate('/enhanced-profile?tab=islamic'),
      actionText: 'Configurer les préférences',
    },
    {
      key: 'photoUploaded' as keyof CompletionStatus,
      title: 'Ajoutez une photo de profil',
      description: 'Une photo augmente vos chances de match de 300%',
      icon: Camera,
      action: () => navigate('/enhanced-profile?tab=profile'),
      actionText: 'Ajouter une photo',
      skipped: skippedDuringOnboarding.includes('photo'),
    },
    {
      key: 'interestsAdded' as keyof CompletionStatus,
      title: "Ajoutez vos centres d'intérêt",
      description: 'Partagez vos passions pour de meilleurs matches',
      icon: Heart,
      action: () => navigate('/enhanced-profile?tab=profile'),
      actionText: 'Ajouter des intérêts',
      skipped: skippedDuringOnboarding.includes('interests'),
    },
    {
      key: 'compatibilityTestTaken' as keyof CompletionStatus,
      title: 'Passez le test de compatibilité',
      description: 'Améliorez la précision de nos recommandations',
      icon: Shield,
      action: () => navigate('/compatibility-test'),
      actionText: 'Faire le test',
    },
    {
      key: 'firstMessageSent' as keyof CompletionStatus,
      title: 'Envoyez votre premier message',
      description: 'Commencez à interagir avec vos matches',
      icon: MessageSquare,
      action: () => navigate('/browse'),
      actionText: 'Découvrir des profils',
    },
  ];

  const completedSteps = Object.values(status).filter(Boolean).length;
  const totalSteps = steps.length;
  const completionPercentage = (completedSteps / totalSteps) * 100;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if user has completed everything
  if (completionPercentage === 100) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Guide de Démarrage</span>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {completedSteps}/{totalSteps} étapes
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(completionPercentage)}% complété
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => {
            const isCompleted = status[step.key];
            const isSkipped = 'skipped' in step && step.skipped;
            const Icon = step.icon;

            // Prioritize skipped items at the top
            return null;
          })}

          {/* Show skipped items first */}
          {steps
            .filter((step) => 'skipped' in step && step.skipped && !status[step.key])
            .map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors bg-gold/10 border border-gold/30"
                >
                  <div className="mt-1">
                    <AlertTriangle className="h-5 w-5 text-gold" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gold">{step.title}</h4>
                          <Badge variant="outline" className="bg-gold/20 text-gold border-gold/40">
                            Sauté
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="default"
                        onClick={step.action}
                        className="ml-4 shrink-0 bg-gold hover:bg-gold/90"
                      >
                        {step.actionText}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Show other incomplete items */}
          {steps
            .filter((step) => !status[step.key] && !('skipped' in step && step.skipped))
            .map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors bg-muted/30"
                >
                  <div className="mt-1">
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={step.action}
                        className="ml-4 shrink-0"
                      >
                        {step.actionText}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Show completed items */}
          {steps
            .filter((step) => status[step.key])
            .map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors bg-emerald/5 border border-emerald/20"
                >
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-emerald">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {completionPercentage > 0 && completionPercentage < 100 && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium text-primary mb-2">Excellent progrès ! 🎉</h4>
            <p className="text-sm text-muted-foreground">
              Plus votre profil est complet, meilleures sont vos chances de trouver des matches
              compatibles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingCompletionGuide;
