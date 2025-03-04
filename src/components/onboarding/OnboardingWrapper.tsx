
import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface OnboardingWrapperProps {
  children: ReactNode;
  steps: string[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  canProceed: boolean;
}

const OnboardingWrapper = ({
  children,
  steps,
  currentStep,
  onNext,
  onPrevious,
  onComplete,
  canProceed,
}: OnboardingWrapperProps) => {
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">
              Complete Your Profile
            </h1>
            <p className="text-center text-gray-600 mb-4">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
            <div className="flex space-x-1 mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full ${
                    index <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-8">{children}</div>
            <div className="flex justify-between pt-6">
              <CustomButton
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </CustomButton>

              {isLastStep ? (
                <CustomButton
                  type="button"
                  onClick={onComplete}
                  disabled={!canProceed}
                >
                  Complete <Check className="ml-2 h-4 w-4" />
                </CustomButton>
              ) : (
                <CustomButton
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </CustomButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWrapper;
