import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Step {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  estimatedTime: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const StepIndicator = ({ steps, currentStep, onStepClick, className = '' }: StepIndicatorProps) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald text-white border-emerald';
      case 'current':
        return 'bg-gold text-white border-gold animate-pulse-gentle';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile: Horizontal scroll */}
      <div className="block md:hidden">
        <div className="flex space-x-4 overflow-x-auto pb-4 px-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const status = getStepStatus(stepNumber);
            const isClickable = status === 'completed' || status === 'current';

            return (
              <div
                key={step.id}
                className={`flex-shrink-0 cursor-pointer transition-all ${
                  isClickable && onStepClick ? 'hover:scale-105' : ''
                }`}
                onClick={() => isClickable && onStepClick?.(stepNumber)}
              >
                <div className="flex flex-col items-center space-y-2 min-w-[80px]">
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStepColor(status)}`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {step.estimatedTime}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const status = getStepStatus(stepNumber);
            const isClickable = status === 'completed' || status === 'current';
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center space-x-4 cursor-pointer transition-all ${
                    isClickable && onStepClick ? 'hover:scale-105' : ''
                  }`}
                  onClick={() => isClickable && onStepClick?.(stepNumber)}
                >
                  {/* Step Circle */}
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStepColor(status)}`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : step.icon ? (
                      <div className="w-5 h-5 flex items-center justify-center">{step.icon}</div>
                    ) : (
                      <span className="font-semibold">{stepNumber}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3
                        className={`font-medium ${
                          status === 'current'
                            ? 'text-gold'
                            : status === 'completed'
                              ? 'text-emerald'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <Badge
                        variant={status === 'current' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {step.estimatedTime}
                      </Badge>
                      {status === 'current' && (
                        <Badge className="text-xs bg-gold text-white">En cours</Badge>
                      )}
                      {status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Terminé
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex items-center mx-4">
                    <div
                      className={`h-0.5 w-8 transition-all ${
                        stepNumber <= currentStep ? 'bg-emerald' : 'bg-muted'
                      }`}
                    />
                    <ArrowRight
                      className={`w-4 h-4 ml-2 transition-all ${
                        stepNumber < currentStep ? 'text-emerald' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-full">
          <Circle className="w-4 h-4 text-muted-foreground fill-current" />
          <span className="text-sm text-muted-foreground">
            Étape {currentStep} sur {steps.length}
          </span>
          <Badge variant="outline" className="text-xs">
            {Math.round(((currentStep - 1) / steps.length) * 100)}% complété
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
