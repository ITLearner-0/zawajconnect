import { useState, useEffect } from 'react';

interface ProfileSection {
  id: string;
  name: string;
  weight: number;
  score: number;
  completed: boolean;
  suggestions: string[];
}

interface ProfileQuality {
  overallScore: number;
  sections: ProfileSection[];
  completionPercentage: number;
  missingSections: string[];
}

interface ProfileData {
  full_name?: string;
  age?: number;
  gender?: string;
  location?: string;
  education?: string;
  profession?: string;
  bio?: string;
  looking_for?: string;
  interests?: string[];
  avatar_url?: string;
}

interface IslamicPreferences {
  prayer_frequency?: string;
  quran_reading?: string;
  hijab_preference?: string;
  beard_preference?: string;
  sect?: string;
  madhab?: string;
  halal_diet?: boolean;
  smoking?: string;
  importance_of_religion?: string;
}

export const useProfileQuality = (
  profileData?: ProfileData,
  islamicPrefs?: IslamicPreferences
) => {
  const [quality, setQuality] = useState<ProfileQuality>({
    overallScore: 0,
    sections: [],
    completionPercentage: 0,
    missingSections: []
  });

  useEffect(() => {
    if (!profileData) return;

    const sections: ProfileSection[] = [
      {
        id: 'basic_info',
        name: 'Informations de base',
        weight: 20,
        score: calculateBasicInfoScore(profileData),
        completed: isBasicInfoComplete(profileData),
        suggestions: getBasicInfoSuggestions(profileData)
      },
      {
        id: 'bio',
        name: 'Biographie',
        weight: 25,
        score: calculateBioScore(profileData),
        completed: isBioComplete(profileData),
        suggestions: getBioSuggestions(profileData)
      },
      {
        id: 'interests',
        name: 'Centres d\'intérêt',
        weight: 15,
        score: calculateInterestsScore(profileData),
        completed: isInterestsComplete(profileData),
        suggestions: getInterestsSuggestions(profileData)
      },
      {
        id: 'islamic',
        name: 'Préférences islamiques',
        weight: 25,
        score: calculateIslamicScore(islamicPrefs),
        completed: isIslamicComplete(islamicPrefs),
        suggestions: getIslamicSuggestions(islamicPrefs)
      },
      {
        id: 'photo',
        name: 'Photo de profil',
        weight: 15,
        score: profileData.avatar_url ? 100 : 0,
        completed: !!profileData.avatar_url,
        suggestions: profileData.avatar_url ? [] : ['Ajoutez une photo de profil claire et récente']
      }
    ];

    const overallScore = sections.reduce((acc, section) => {
      return acc + (section.score * section.weight) / 100;
    }, 0);

    const completedSections = sections.filter(s => s.completed).length;
    const completionPercentage = (completedSections / sections.length) * 100;

    const missingSections = sections
      .filter(s => !s.completed)
      .map(s => s.name);

    setQuality({
      overallScore: Math.round(overallScore),
      sections,
      completionPercentage: Math.round(completionPercentage),
      missingSections
    });
  }, [profileData, islamicPrefs]);

  return quality;
};

// Helper functions
const calculateBasicInfoScore = (profile: ProfileData): number => {
  const fields = ['full_name', 'age', 'gender', 'location', 'education', 'profession'];
  const completed = fields.filter(field => profile[field as keyof ProfileData]).length;
  return Math.round((completed / fields.length) * 100);
};

const isBasicInfoComplete = (profile: ProfileData): boolean => {
  return !!(profile.full_name && profile.age && profile.gender && 
            profile.location && profile.education && profile.profession);
};

const getBasicInfoSuggestions = (profile: ProfileData): string[] => {
  const suggestions: string[] = [];
  if (!profile.full_name) suggestions.push('Ajoutez votre nom complet');
  if (!profile.age) suggestions.push('Indiquez votre âge');
  if (!profile.gender) suggestions.push('Sélectionnez votre genre');
  if (!profile.location) suggestions.push('Précisez votre localisation');
  if (!profile.education) suggestions.push('Ajoutez votre niveau d\'éducation');
  if (!profile.profession) suggestions.push('Indiquez votre profession');
  return suggestions;
};

const calculateBioScore = (profile: ProfileData): number => {
  if (!profile.bio) return 0;
  const length = profile.bio.length;
  if (length < 50) return 25;
  if (length < 100) return 50;
  if (length < 200) return 75;
  return 100;
};

const isBioComplete = (profile: ProfileData): boolean => {
  return !!(profile.bio && profile.bio.length >= 100);
};

const getBioSuggestions = (profile: ProfileData): string[] => {
  const suggestions: string[] = [];
  if (!profile.bio) {
    suggestions.push('Écrivez une biographie pour vous présenter');
  } else if (profile.bio.length < 50) {
    suggestions.push('Développez votre biographie (minimum 50 caractères)');
  } else if (profile.bio.length < 100) {
    suggestions.push('Ajoutez plus de détails sur vous (100+ caractères recommandés)');
  } else if (profile.bio.length < 200) {
    suggestions.push('Une bio de 200+ caractères augmente vos chances de match');
  }
  return suggestions;
};

const calculateInterestsScore = (profile: ProfileData): number => {
  const interests = profile.interests || [];
  if (interests.length === 0) return 0;
  if (interests.length < 3) return 33;
  if (interests.length < 5) return 66;
  return 100;
};

const isInterestsComplete = (profile: ProfileData): boolean => {
  return (profile.interests?.length || 0) >= 3;
};

const getInterestsSuggestions = (profile: ProfileData): string[] => {
  const count = profile.interests?.length || 0;
  const suggestions: string[] = [];
  if (count === 0) {
    suggestions.push('Ajoutez au moins 3 centres d\'intérêt');
  } else if (count < 3) {
    suggestions.push(`Ajoutez ${3 - count} centre(s) d'intérêt supplémentaire(s)`);
  } else if (count < 5) {
    suggestions.push('5+ centres d\'intérêt améliorent la précision du matching');
  }
  return suggestions;
};

const calculateIslamicScore = (prefs?: IslamicPreferences): number => {
  if (!prefs) return 0;
  const fields = ['prayer_frequency', 'quran_reading', 'sect', 'importance_of_religion'];
  const completed = fields.filter(field => prefs[field as keyof IslamicPreferences]).length;
  return Math.round((completed / fields.length) * 100);
};

const isIslamicComplete = (prefs?: IslamicPreferences): boolean => {
  return !!(prefs?.prayer_frequency && prefs?.quran_reading && 
            prefs?.sect && prefs?.importance_of_religion);
};

const getIslamicSuggestions = (prefs?: IslamicPreferences): string[] => {
  const suggestions: string[] = [];
  if (!prefs) {
    suggestions.push('Complétez vos préférences islamiques');
    return suggestions;
  }
  if (!prefs.prayer_frequency) suggestions.push('Indiquez votre fréquence de prière');
  if (!prefs.quran_reading) suggestions.push('Précisez votre lecture du Coran');
  if (!prefs.sect) suggestions.push('Spécifiez votre courant islamique');
  if (!prefs.importance_of_religion) suggestions.push('Indiquez l\'importance de la religion pour vous');
  return suggestions;
};
