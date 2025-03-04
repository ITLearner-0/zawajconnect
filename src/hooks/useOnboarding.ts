
import { useState, useEffect } from "react";
import { isFieldRequired } from "@/utils/profileTooltips";
import { ProfileFormData } from "@/types/profile";

export const useOnboarding = (formData: ProfileFormData, isNewUser: boolean) => {
  const [isOnboarding, setIsOnboarding] = useState(isNewUser);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Basic Information",
    "Education & Career",
    "Religious Background",
    "About Me"
  ];

  // Check if the current step is complete enough to proceed
  const canProceedCurrentStep = (): boolean => {
    const requiredFieldsByStep: Record<number, string[]> = {
      0: ["fullName", "gender", "location"],
      1: [],
      2: ["religiousLevel"],
      3: ["aboutMe"]
    };

    return requiredFieldsByStep[currentStep].every(
      (field) => formData[field as keyof ProfileFormData]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
  };

  return {
    isOnboarding,
    setIsOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep
  };
};
