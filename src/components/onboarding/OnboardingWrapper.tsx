
import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { IslamicPattern } from "@/components/ui/islamic-pattern";

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
    <div className="min-h-screen bg-gradient-to-b from-islamic-cream to-background py-12 relative">
      <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
      <div className="container max-w-3xl mx-auto px-4 relative z-10">
        <IslamicPattern variant="card" color="teal" className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-islamic-teal to-islamic-teal/90 text-white">
            <h1 className="text-2xl font-bold text-center">
              Complete Your Profile
            </h1>
            <p className="text-center text-islamic-cream mb-4">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
            <div className="flex space-x-1 mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? "bg-islamic-gold" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-8">{children}</div>
            <div className="flex justify-between pt-6">
              <CustomButton
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 0}
                className="border-islamic-teal/20 text-islamic-teal hover:bg-islamic-teal/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </CustomButton>

              {isLastStep ? (
                <CustomButton
                  type="button"
                  onClick={onComplete}
                  disabled={!canProceed}
                  variant="teal"
                  className="group"
                >
                  Complete <Check className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </CustomButton>
              ) : (
                <CustomButton
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed}
                  variant="teal"
                  className="group"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
