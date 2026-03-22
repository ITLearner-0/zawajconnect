import { useState, useEffect } from 'react';
import { isFieldRequired } from '@/utils/profileTooltips';
import { ProfileFormData } from '@/types/profile';

export const useOnboarding = (
  formData: ProfileFormData,
  isNewUser: boolean,
  onClearWaliData?: () => void
) => {
  const STORAGE_KEY = 'zawaj_onboarding_step';

  const [isOnboarding, setIsOnboarding] = useState(isNewUser);
  const [currentStep, setCurrentStep] = useState(() => {
    if (!isNewUser) return 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Get base steps
  const getSteps = () => {
    const baseSteps = [
      'Informations de base',
      'Éducation et carrière',
      'Parcours religieux',
      'À propos de moi',
      'Photo de profil',
    ];

    // Add Wali Information step only for female users
    if (formData.gender === 'female') {
      baseSteps.push('Informations du Wali');
    }

    // Always end with summary
    baseSteps.push('Récapitulatif');

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
      4: [], // Photo step - optional
      5: formData.gender === 'female' ? ['waliName', 'waliRelationship', 'waliContact'] : [],
    };

    const requiredFields = requiredFieldsByStep[currentStep] ?? [];
    return requiredFields.every((field) => {
      const value = formData[field as keyof ProfileFormData];
      if (!value) return false;
      // Enforce 50 chars minimum for aboutMe
      if (field === 'aboutMe' && typeof value === 'string' && value.length < 50) return false;
      return true;
    });
  };

  // Get validation errors for the current step
  const getStepErrors = (): string[] => {
    const errors: string[] = [];
    const fieldLabels: Record<string, string> = {
      fullName: 'Nom complet',
      gender: 'Genre',
      location: 'Localisation',
      religiousLevel: 'Niveau de pratique religieuse',
      aboutMe: 'À propos de moi',
      waliName: 'Nom du Wali',
      waliRelationship: 'Relation du Wali',
      waliContact: 'Contact du Wali',
    };

    const requiredFieldsByStep: Record<number, string[]> = {
      0: ['fullName', 'gender', 'location'],
      1: [],
      2: ['religiousLevel'],
      3: ['aboutMe'],
      4: [], // Photo step - optional
      5: formData.gender === 'female' ? ['waliName', 'waliRelationship', 'waliContact'] : [],
    };

    const requiredFields = requiredFieldsByStep[currentStep] ?? [];
    for (const field of requiredFields) {
      const value = formData[field as keyof ProfileFormData];
      if (!value) {
        errors.push(`${fieldLabels[field] || field} est requis`);
      } else if (field === 'aboutMe' && typeof value === 'string' && value.length < 50) {
        errors.push(`À propos de moi doit contenir au moins 50 caractères (${value.length}/50)`);
      }
    }
    return errors;
  };

  const persistStep = (step: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(step));
    } catch {
      // localStorage may be unavailable
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      persistStep(next);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      persistStep(prev);
    }
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable
    }
  };

  // Update steps when gender changes and clean wali data if switching away from female
  useEffect(() => {
    const newSteps = getSteps();
    if (formData.gender !== 'female') {
      // Clear wali data when user is not female
      onClearWaliData?.();
      if (currentStep >= newSteps.length) {
        setCurrentStep(newSteps.length - 1);
      }
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
    getStepErrors,
  };
};
