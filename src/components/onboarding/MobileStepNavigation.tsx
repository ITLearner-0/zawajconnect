import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface MobileStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => void;
  className?: string;
}

const MobileStepNavigation = ({
  currentStep,
  totalSteps,
  isStepValid,
  canGoNext,
  canGoPrevious,
  isLoading = false,
  onPrevious,
  onNext,
  onComplete,
  className = ""
}: MobileStepNavigationProps) => {
  
  const progress = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps;

  const getStepStatus = () => {
    if (isStepValid) {
      return { 
        icon: <CheckCircle className="w-4 h-4 text-emerald" />, 
        text: "Étape complète",
        color: "text-emerald"
      };
    } else {
      return { 
        icon: <AlertCircle className="w-4 h-4 text-gold" />, 
        text: "Remplissez les champs requis",
        color: "text-gold"
      };
    }
  };

  const status = getStepStatus();

  return (
    <div className={`bg-white border-t border-muted/30 p-4 space-y-4 ${className}`}>
      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </span>
          <Badge variant={isStepValid ? "default" : "secondary"} className="text-xs">
            {Math.round(progress)}% complété
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {/* Step Status */}
        <div className="flex items-center space-x-2">
          {status.icon}
          <span className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-3">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className="flex-1 max-w-[120px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Précédent
        </Button>

        {/* Next/Complete Button */}
        <Button
          onClick={isLastStep ? onComplete : onNext}
          disabled={!canGoNext || isLoading}
          className="flex-1 bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-light hover:to-emerald"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Terminer
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Quick Step Indicator for Mobile */}
      <div className="flex justify-center">
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            
            return (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  isCompleted 
                    ? 'bg-emerald' 
                    : isCurrent 
                    ? 'bg-gold w-4' 
                    : 'bg-muted'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileStepNavigation;