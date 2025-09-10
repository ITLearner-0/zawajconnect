import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, User, Heart, Camera, Shield, MessageSquare } from 'lucide-react';

interface CompletionStatus {
  profileComplete: boolean;
  islamicPrefsSet: boolean;
  photoUploaded: boolean;
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
    compatibilityTestTaken: false,
    firstMessageSent: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkCompletionStatus();
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

      const profileComplete = !!(profile && profile.full_name && profile.age && profile.bio && profile.looking_for);
      const photoUploaded = !!(profile && profile.avatar_url);

      // Check Islamic preferences
      const { data: islamicPrefs } = await supabase
        .from('islamic_preferences')
        .select('sect, prayer_frequency, importance_of_religion')
        .eq('user_id', user.id)
        .maybeSingle();

      const islamicPrefsSet = !!(islamicPrefs && islamicPrefs.sect && islamicPrefs.prayer_frequency);

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
        compatibilityTestTaken,
        firstMessageSent
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
      actionText: 'Compléter le profil'
    },
    {
      key: 'islamicPrefsSet' as keyof CompletionStatus,
      title: 'Définissez vos préférences islamiques',
      description: 'Configurez vos critères religieux pour un meilleur matching',
      icon: Heart,
      action: () => navigate('/enhanced-profile?tab=islamic'),
      actionText: 'Configurer les préférences'
    },
    {
      key: 'photoUploaded' as keyof CompletionStatus,
      title: 'Ajoutez une photo de profil',
      description: 'Une photo augmente vos chances de match de 300%',
      icon: Camera,
      action: () => navigate('/enhanced-profile?tab=profile'),
      actionText: 'Ajouter une photo'
    },
    {
      key: 'compatibilityTestTaken' as keyof CompletionStatus,
      title: 'Passez le test de compatibilité',
      description: 'Améliorez la précision de nos recommandations',
      icon: Shield,
      action: () => navigate('/compatibility-test'),
      actionText: 'Faire le test'
    },
    {
      key: 'firstMessageSent' as keyof CompletionStatus,
      title: 'Envoyez votre premier message',
      description: 'Commencez à interagir avec vos matches',
      icon: MessageSquare,
      action: () => navigate('/browse'),
      actionText: 'Découvrir des profils'
    }
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
            const Icon = step.icon;
            
            return (
              <div
                key={step.key}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isCompleted ? 'bg-emerald/5 border border-emerald/20' : 'bg-muted/30'
                }`}
              >
                <div className="mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${isCompleted ? 'text-emerald' : 'text-foreground'}`}>
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                    
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={step.action}
                        className="ml-4 shrink-0"
                      >
                        {step.actionText}
                      </Button>
                    )}
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
              Plus votre profil est complet, meilleures sont vos chances de trouver des matches compatibles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingCompletionGuide;