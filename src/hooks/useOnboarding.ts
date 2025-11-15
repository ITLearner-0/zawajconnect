import { useState, useEffect } from 'react';
import { isFieldRequired } from '@/utils/profileTooltips';
import { ProfileFormData } from '@/types/profile';

export const useOnboarding = (formData: ProfileFormData, isNewUser: boolean) => {
  const [isOnboarding, setIsOnboarding] = useState(isNewUser);
  const [currentStep, setCurrentStep] = useState(0);

  // Get base steps
  const getSteps = () => {
    const baseSteps = [
      'Basic Information',
      'Education & Career',
      'Religious Background',
      'About Me',
    ];

    // Add Wali Information step only for female users
    if (formData.gender === 'female') {
      baseSteps.push('Wali Information');
    }

    return baseSteps;
  };

  const steps = getSteps();

  // Check if the current step is complete enough to proceed
  const canProceedCurrentStep = (): boolean => {
    const requiredFieldsByStep: Record<number, string[]> = {
      0: ['fullName', 'gender', 'location'],
      1: [],
      2: ['religiousLevel'],
      3: ['aboutMe'],
      4: formData.gender === 'female' ? ['waliName', 'waliRelationship', 'waliContact'] : [],
    };

    return (
      requiredFieldsByStep[currentStep]?.every(
        (field) => formData[field as keyof ProfileFormData]
      ) ?? true
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

  // Update steps when gender changes
  useEffect(() => {
    const newSteps = getSteps();
    // If user changed from female to male and we're on the Wali step, go back to About Me
    if (formData.gender !== 'female' && currentStep >= newSteps.length) {
      setCurrentStep(newSteps.length - 1);
    }
  }, [formData.gender, currentStep]);

  return {
    isOnboarding,
    setIsOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep,
  };
};
