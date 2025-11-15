// @ts-nocheck
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigationAnalytics } from '@/hooks/useNavigationAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TourStep {
  title: string;
  description: string;
  feature: string;
  shortcut?: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Bienvenue dans la navigation avancée',
    description:
      'Découvrez les fonctionnalités qui vous permettront de naviguer plus efficacement dans ZawajConnect.',
    feature: 'overview',
  },
  {
    title: 'Raccourcis clavier',
    description:
      'Utilisez Alt+H pour le tableau de bord, Alt+P pour le profil, Alt+M pour les matches, et bien plus !',
    feature: 'keyboard',
    shortcut: 'Alt+?',
  },
  {
    title: 'Navigation rapide',
    description:
      "Cliquez sur l'icône de navigation rapide dans l'en-tête pour accéder rapidement à vos pages favorites.",
    feature: 'quick-nav',
  },
  {
    title: 'Recherche de pages',
    description:
      "Appuyez sur '/' n'importe où pour ouvrir la recherche et trouvez rapidement la page que vous cherchez.",
    feature: 'search',
    shortcut: '/',
  },
  {
    title: 'Suggestions intelligentes',
    description:
      'Le système vous propose des pages pertinentes basées sur votre navigation et vos habitudes.',
    feature: 'suggestions',
  },
  {
    title: "Fil d'Ariane interactif",
    description:
      "Utilisez le fil d'Ariane pour naviguer dans l'historique et revenir rapidement aux pages précédentes.",
    feature: 'breadcrumb',
  },
];

interface NavigationTourProps {
  show: boolean;
  onComplete: () => void;
}

const NavigationTour = ({ show, onComplete }: NavigationTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { trackAction } = useNavigationAnalytics();

  useEffect(() => {
    if (show) {
      trackAction('navigation_tour_started', { timestamp: Date.now() });
    }
  }, [show, trackAction]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackAction('navigation_tour_step', {
        step: currentStep + 1,
        feature: tourSteps[currentStep + 1].feature,
      });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    trackAction('navigation_tour_completed', {
      steps_viewed: currentStep + 1,
      completed: true,
    });
    onComplete();
  };

  const handleSkip = () => {
    trackAction('navigation_tour_skipped', {
      steps_viewed: currentStep + 1,
      skipped_at_step: currentStep,
    });
    onComplete();
  };

  if (!show) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <Dialog open={show} onOpenChange={() => handleSkip()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Tour de navigation
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1}/{tourSteps.length}
            </span>
          </div>

          {/* Step content */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>

            {step.shortcut && (
              <Badge variant="secondary" className="font-mono">
                {step.shortcut}
              </Badge>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Passer
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {isLastStep ? 'Terminer' : 'Suivant'}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavigationTour;
