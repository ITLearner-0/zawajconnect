import { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import CustomButton from '@/components/CustomButton';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

interface OnboardingWrapperProps {
  children: ReactNode;
  steps: string[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  canProceed: boolean;
  errors?: string[];
}

const OnboardingWrapper = ({
  children,
  steps,
  currentStep,
  onNext,
  onPrevious,
  onComplete,
  canProceed,
  errors = [],
}: OnboardingWrapperProps) => {
  const [showErrors, setShowErrors] = useState(false);
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-islamic-cream to-background py-12 relative">
      <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
      <div className="container max-w-3xl mx-auto px-4 relative z-10">
        <IslamicPattern variant="card" color="teal" className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-islamic-teal to-islamic-teal/90 text-white">
            <h1 className="text-2xl font-bold text-center">Complétez votre profil</h1>
            <p className="text-center text-islamic-cream mb-4">
              Étape {currentStep + 1} sur {steps.length} : {steps[currentStep]}
            </p>
            <div className="flex space-x-1 mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? 'bg-islamic-gold' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-8">{children}</div>

            {/* Inline error messages */}
            {showErrors && !canProceed && errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-700">Champs requis manquants</span>
                </div>
                <ul className="ml-6 space-y-1">
                  {errors.map((err, i) => (
                    <li key={i} className="text-sm text-red-600">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <CustomButton
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 0}
                className="border-islamic-teal/20 text-islamic-teal hover:bg-islamic-teal/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </CustomButton>

              {isLastStep ? (
                <CustomButton
                  type="button"
                  onClick={() => {
                    if (canProceed) {
                      setShowErrors(false);
                      onComplete();
                    } else {
                      setShowErrors(true);
                    }
                  }}
                  variant="teal"
                  className="group"
                >
                  Terminer{' '}
                  <Check className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </CustomButton>
              ) : (
                <CustomButton
                  type="button"
                  onClick={() => {
                    if (canProceed) {
                      setShowErrors(false);
                      onNext();
                    } else {
                      setShowErrors(true);
                    }
                  }}
                  variant="teal"
                  className="group"
                >
                  Suivant{' '}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </CustomButton>
              )}
            </div>
          </CardContent>
        </IslamicPattern>
      </div>
    </div>
  );
};

export default OnboardingWrapper;
