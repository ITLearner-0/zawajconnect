import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Heart,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Gift,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  route?: string;
  reward?: {
    type: 'badge' | 'points' | 'unlock';
    value: string;
    description: string;
  };
}

interface OnboardingFlowProps {
  onComplete?: () => void;
  showRewards?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, showRewards = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complétez votre profil',
      description: 'Ajoutez vos informations personnelles et votre photo',
      icon: <User className="w-5 h-5" />,
      completed: completedSteps.has('profile'),
      route: '/enhanced-profile',
      reward: {
        type: 'points',
        value: '50',
        description: '+50 points pour un profil complet',
      },
    },
    {
      id: 'compatibility',
      title: 'Test de compatibilité',
      description: 'Découvrez votre profil de compatibilité personnalisé',
      icon: <Heart className="w-5 h-5" />,
      completed: completedSteps.has('compatibility'),
      route: '/compatibility-test',
      reward: {
        type: 'badge',
        value: 'Explorer',
        description: 'Badge Explorer débloqué',
      },
    },
    {
      id: 'insights',
      title: 'Consultez vos insights',
      description: 'Analysez vos résultats et recommandations personnalisées',
      icon: <Target className="w-5 h-5" />,
      completed: completedSteps.has('insights'),
      route: '/compatibility-insights',
      reward: {
        type: 'unlock',
        value: 'Recherche avancée',
        description: 'Accès à la recherche avancée débloqué',
      },
    },
  ];

  const overallProgress = (completedSteps.size / steps.length) * 100;

  useEffect(() => {
    // Simulate checking completion status
    // In a real app, this would check user data from the backend
    const checkCompletionStatus = async () => {
      // Mock completion check - would be replaced with real data
      if (user) {
        const mockCompleted = new Set<string>();
        // Add logic to check actual completion status
        setCompletedSteps(mockCompleted);
      }
    };

    checkCompletionStatus();
  }, [user]);

  const handleStepClick = (step: OnboardingStep, index: number) => {
    if (step.route) {
      navigate(step.route);
    }

    if (!step.completed && showRewards) {
      // Mark step as completed (in real app, this would be backend call)
      const newCompleted = new Set(completedSteps);
      newCompleted.add(step.id);
      setCompletedSteps(newCompleted);

      // Show celebration for this step
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const getStepStatus = (step: OnboardingStep, index: number) => {
    if (step.completed) return 'completed';
    if (index === currentStep) return 'current';
    if (index < currentStep) return 'available';
    return 'locked';
  };

  const getStepVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'current':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    if (completedSteps.size === steps.length && onComplete) {
      onComplete();
    }
  }, [completedSteps.size, steps.length, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span>Votre parcours ZawajConnect</span>
            </CardTitle>
            <Badge variant="secondary" className="animate-pulse-gentle">
              {Math.round(overallProgress)}% complété
            </Badge>
          </div>
          <Progress value={overallProgress} className="h-3 animate-slide-in-right" />
        </CardHeader>
      </Card>

      {/* Celebration Modal */}
      {showCelebration && (
        <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in bg-gradient-to-br from-emerald/95 to-gold/95 backdrop-blur border-emerald/20">
          <CardContent className="p-6 text-center">
            <div className="animate-float mb-4">
              <Sparkles className="w-12 h-12 mx-auto text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Félicitations ! 🎉</h3>
            <p className="text-emerald-light text-sm">Vous avez franchi une nouvelle étape</p>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isClickable =
            status === 'current' || status === 'available' || status === 'completed';

          return (
            <Card
              key={step.id}
              className={`transition-all duration-300 cursor-pointer card-hover animate-fade-in ${
                status === 'completed'
                  ? 'bg-emerald/5 border-emerald/20'
                  : status === 'current'
                    ? 'bg-gold/5 border-gold/20'
                    : 'hover:bg-muted/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => isClickable && handleStepClick(step, index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Step Icon */}
                  <div
                    className={`p-3 rounded-full flex items-center justify-center transition-colors ${
                      step.completed
                        ? 'bg-emerald text-white'
                        : status === 'current'
                          ? 'bg-gold text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3
                        className={`font-medium ${
                          step.completed ? 'text-emerald' : 'text-foreground'
                        }`}
                      >
                        {step.title}
                      </h3>
                      {step.completed && (
                        <Badge variant="secondary" className="text-xs animate-scale-in">
                          ✓ Terminé
                        </Badge>
                      )}
                      {status === 'current' && (
                        <Badge className="text-xs animate-pulse-gentle bg-gold">En cours</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>

                    {/* Reward Preview */}
                    {step.reward && showRewards && (
                      <div className="flex items-center space-x-2 text-xs">
                        <Gift className="w-3 h-3 text-gold" />
                        <span className="text-gold font-medium">{step.reward.description}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Arrow */}
                  {isClickable && (
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        step.completed ? 'text-emerald' : 'text-muted-foreground'
                      } group-hover:translate-x-1`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {overallProgress === 100 && (
        <Card className="bg-gradient-to-r from-emerald to-gold text-white animate-fade-in">
          <CardContent className="p-6 text-center">
            <div className="animate-float mb-4">
              <Star className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">Parcours terminé ! 🎉</h3>
            <p className="text-emerald-light mb-4">
              Vous êtes maintenant prêt(e) à découvrir votre âme sœur
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate('/browse')}
              className="bg-white text-emerald hover:bg-emerald-light hover:text-white"
            >
              Découvrir les profils
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnboardingFlow;
