import { useMemo } from 'react';

interface ProfileData {
  full_name: string;
  age: number | undefined;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url: string;
}

interface IslamicPreferences {
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference: string;
  beard_preference: string;
  sect: string;
  madhab: string;
  halal_diet: boolean;
  smoking: string;
  desired_partner_sect: string;
  importance_of_religion: string;
}

interface ValidationRule {
  field: string;
  label: string;
  isValid: boolean;
  message?: string;
  isRequired?: boolean;
}

interface UseOnboardingValidationProps {
  profileData: ProfileData;
  islamicPrefs: IslamicPreferences;
  currentStep: number;
}

export const useOnboardingValidation = ({
  profileData,
  islamicPrefs,
  currentStep,
}: UseOnboardingValidationProps) => {
  const stepValidationRules = useMemo(() => {
    const rules: { [key: number]: ValidationRule[] } = {
      1: [
        {
          field: 'full_name',
          label: 'Nom complet',
          isValid: profileData.full_name.trim().length >= 2,
          message: 'Le nom doit contenir au moins 2 caractères',
          isRequired: true,
        },
        {
          field: 'age',
          label: 'Âge',
          isValid: profileData.age !== undefined && profileData.age >= 18 && profileData.age <= 80,
          message: "L'âge doit être entre 18 et 80 ans",
          isRequired: true,
        },
        {
          field: 'gender',
          label: 'Genre',
          isValid: ['male', 'female'].includes(profileData.gender),
          message: 'Veuillez sélectionner votre genre',
          isRequired: true,
        },
        {
          field: 'location',
          label: 'Localisation',
          isValid: profileData.location.trim().length >= 2,
          message: 'La localisation doit contenir au moins 2 caractères',
          isRequired: true,
        },
      ],
      2: [
        {
          field: 'education',
          label: 'Éducation',
          isValid: profileData.education.trim().length >= 3,
          message: "L'éducation doit contenir au moins 3 caractères",
          isRequired: true,
        },
        {
          field: 'profession',
          label: 'Profession',
          isValid: profileData.profession.trim().length >= 3,
          message: 'La profession doit contenir au moins 3 caractères',
          isRequired: true,
        },
        {
          field: 'bio',
          label: 'Description personnelle',
          isValid: profileData.bio.trim().length >= 50,
          message: 'La description doit contenir au moins 50 caractères',
          isRequired: true,
        },
        {
          field: 'interests',
          label: "Centres d'intérêt",
          isValid: profileData.interests.length >= 3,
          message: "Ajoutez au moins 3 centres d'intérêt",
          isRequired: false,
        },
        {
          field: 'avatar_url',
          label: 'Photo de profil',
          isValid: profileData.avatar_url.length > 0,
          message: 'Une photo de profil est fortement recommandée',
          isRequired: false,
        },
      ],
      3: [
        {
          field: 'prayer_frequency',
          label: 'Fréquence de prière',
          isValid: islamicPrefs.prayer_frequency.length > 0,
          message: 'Veuillez indiquer votre fréquence de prière',
          isRequired: true,
        },
        {
          field: 'sect',
          label: 'Secte',
          isValid: islamicPrefs.sect.length > 0,
          message: 'Veuillez indiquer votre secte',
          isRequired: true,
        },
        {
          field: 'importance_of_religion',
          label: 'Importance de la religion',
          isValid: islamicPrefs.importance_of_religion.length > 0,
          message: "Veuillez indiquer l'importance de la religion pour vous",
          isRequired: true,
        },
        {
          field: 'quran_reading',
          label: 'Lecture du Coran',
          isValid: islamicPrefs.quran_reading.length > 0,
          message: 'Indiquez votre fréquence de lecture du Coran',
          isRequired: false,
        },
        {
          field: 'madhab',
          label: 'Madhab',
          isValid: islamicPrefs.madhab.length > 0,
          message: 'Indiquez votre madhab si applicable',
          isRequired: false,
        },
      ],
      4: [
        {
          field: 'looking_for',
          label: 'Ce que vous recherchez',
          isValid: profileData.looking_for.trim().length >= 30,
          message: 'Décrivez ce que vous recherchez (minimum 30 caractères)',
          isRequired: true,
        },
      ],
    };

    return rules;
  }, [profileData, islamicPrefs]);

  const getCurrentStepRules = () => {
    return stepValidationRules[currentStep] || [];
  };

  const isStepValid = (step: number) => {
    const rules = stepValidationRules[step] || [];
    return rules.filter((rule) => rule.isRequired).every((rule) => rule.isValid);
  };

  const getOverallProgress = () => {
    const allRules = Object.values(stepValidationRules).flat();
    const validRules = allRules.filter((rule) => rule.isValid);
    return Math.round((validRules.length / allRules.length) * 100);
  };

  const getRequiredProgress = () => {
    const requiredRules = Object.values(stepValidationRules)
      .flat()
      .filter((rule) => rule.isRequired);
    const validRequiredRules = requiredRules.filter((rule) => rule.isValid);
    return Math.round((validRequiredRules.length / requiredRules.length) * 100);
  };

  const getStepProgress = (step: number) => {
    const rules = stepValidationRules[step] || [];
    if (rules.length === 0) return 100;
    const validRules = rules.filter((rule) => rule.isValid);
    return Math.round((validRules.length / rules.length) * 100);
  };

  const getNextIncompleteStep = () => {
    for (let step = 1; step <= 4; step++) {
      if (!isStepValid(step)) {
        return step;
      }
    }
    return null;
  };

  const getMissingRequiredFields = () => {
    const allRules = Object.values(stepValidationRules).flat();
    return allRules.filter((rule) => rule.isRequired && !rule.isValid);
  };

  const getOptionalCompletedFields = () => {
    const allRules = Object.values(stepValidationRules).flat();
    return allRules.filter((rule) => !rule.isRequired && rule.isValid);
  };

  return {
    getCurrentStepRules,
    isStepValid,
    getOverallProgress,
    getRequiredProgress,
    getStepProgress,
    getNextIncompleteStep,
    getMissingRequiredFields,
    getOptionalCompletedFields,
    stepValidationRules,
  };
};

export default useOnboardingValidation;
