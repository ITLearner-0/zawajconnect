import { useState, useEffect } from 'react';
import { isFieldRequired } from '@/utils/profileTooltips';
import { ProfileFormData } from '@/types/profile';

type StepId =
  | 'basic'
  | 'education'
  | 'religious'
  | 'about'
  | 'photo'
  | 'verification'
  | 'wali'
  | 'summary';

interface StepDef {
  id: StepId;
  label: string;
  requiredFields: string[];
}

const STEP_DEFS: StepDef[] = [
  { id: 'basic', label: 'Informations de base', requiredFields: ['fullName', 'gender', 'location'] },
  { id: 'education', label: 'Éducation et carrière', requiredFields: [] },
  { id: 'religious', label: 'Parcours religieux', requiredFields: ['religiousLevel'] },
  { id: 'about', label: 'À propos de moi', requiredFields: ['aboutMe'] },
  { id: 'photo', label: 'Photo de profil', requiredFields: [] },
  { id: 'verification', label: 'Vérification', requiredFields: [] },
  { id: 'wali', label: 'Informations du Wali', requiredFields: ['waliName', 'waliRelationship', 'waliContact'] },
  { id: 'summary', label: 'Récapitulatif', requiredFields: [] },
];

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Nom complet',
  gender: 'Genre',
  location: 'Localisation',
  religiousLevel: 'Niveau de pratique religieuse',
  aboutMe: 'À propos de moi',
  waliName: 'Nom du Wali',
  waliRelationship: 'Relation du Wali',
  waliContact: 'Contact du Wali',
};

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

  // Build active steps based on gender
  const getActiveSteps = (): StepDef[] => {
    return STEP_DEFS.filter((step) => {
      if (step.id === 'wali') return formData.gender === 'female';
      return true;
    });
  };

  const activeSteps = getActiveSteps();
  const steps = activeSteps.map((s) => s.label);

  // Get current step definition
  const currentStepDef = activeSteps[currentStep];

  // Check if the current step is complete enough to proceed
  const canProceedCurrentStep = (): boolean => {
    if (!currentStepDef) return true;
    return currentStepDef.requiredFields.every((field) => {
      const value = formData[field as keyof ProfileFormData];
      if (!value) return false;
      if (field === 'aboutMe' && typeof value === 'string' && value.length < 50) return false;
      return true;
    });
  };

  // Get validation errors for the current step
  const getStepErrors = (): string[] => {
    if (!currentStepDef) return [];
    const errors: string[] = [];
    for (const field of currentStepDef.requiredFields) {
      const value = formData[field as keyof ProfileFormData];
      if (!value) {
        errors.push(`${FIELD_LABELS[field] || field} est requis`);
      } else if (field === 'aboutMe' && typeof value === 'string' && value.length < 50) {
        errors.push(`À propos de moi doit contenir au moins 50 caractères (${value.length}/50)`);
      }
    }
    return errors;
  };

  // Get the step ID for the current step (used by ProfileOnboarding to render content)
  const currentStepId = currentStepDef?.id ?? 'basic';

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
    const newSteps = getActiveSteps();
    if (formData.gender !== 'female') {
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
    currentStepId,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep,
    getStepErrors,
  };
};
