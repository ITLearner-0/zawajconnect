import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TutorialStep {
  id: string;
  field: string;
  title: string;
  description: string;
  tips: string[];
  example: string;
}

const TUTORIAL_STEPS: Record<number, TutorialStep[]> = {
  1: [
    {
      id: 'full_name',
      field: 'full_name',
      title: 'Votre nom complet',
      description: 'Utilisez votre vrai nom pour établir la confiance',
      tips: [
        'Soyez authentique - utilisez votre vrai nom',
        'Évitez les pseudonymes ou surnoms',
        'La transparence est clé dans les rencontres halal'
      ],
      example: 'Ahmed Ben Ali'
    },
    {
      id: 'age',
      field: 'age',
      title: 'Votre âge',
      description: 'L\'âge aide à trouver des correspondances compatibles',
      tips: [
        'Soyez honnête sur votre âge',
        'L\'âge influence les préférences de correspondance',
        'Important pour les objectifs matrimoniaux'
      ],
      example: '28'
    },
    {
      id: 'location',
      field: 'location',
      title: 'Votre localisation',
      description: 'La proximité géographique facilite les rencontres',
      tips: [
        'Indiquez votre ville ou région',
        'Plus précis = meilleures correspondances locales',
        'Important pour planifier les rencontres'
      ],
      example: 'Paris, France'
    }
  ],
  2: [
    {
      id: 'bio',
      field: 'bio',
      title: 'Votre biographie',
      description: 'Présentez-vous de manière authentique et engageante',
      tips: [
        'Visez 150-250 caractères pour l\'optimal',
        'Parlez de vos valeurs, passions et objectifs',
        'Soyez positif et authentique',
        'Mentionnez ce qui vous rend unique'
      ],
      example: 'Ingénieur passionné par la technologie et l\'innovation. J\'aime voyager, découvrir de nouvelles cultures et pratiquer le sport. Je recherche une personne partageant mes valeurs pour construire une famille solide basée sur la foi et le respect mutuel.'
    },
    {
      id: 'interests',
      field: 'interests',
      title: 'Vos centres d\'intérêt',
      description: 'Les intérêts communs créent des connexions',
      tips: [
        'Ajoutez au moins 5 intérêts variés',
        'Incluez des activités spirituelles et récréatives',
        'Soyez spécifique plutôt que générique',
        'Les intérêts augmentent vos chances de match de 40%'
      ],
      example: 'Lecture du Coran, Randonnée, Cuisine, Voyage, Bénévolat'
    }
  ],
  3: [
    {
      id: 'islamic_prefs',
      field: 'prayer_frequency',
      title: 'Préférences islamiques',
      description: 'La compatibilité religieuse est essentielle',
      tips: [
        'Soyez honnête sur votre pratique',
        'Ces informations aident à trouver des partenaires compatibles',
        'Le respect mutuel de la foi est fondamental',
        'Complétez toutes les sections pour de meilleurs matchs'
      ],
      example: 'Prières quotidiennes, lecture régulière du Coran'
    }
  ],
  4: [
    {
      id: 'looking_for',
      field: 'looking_for',
      title: 'Ce que vous recherchez',
      description: 'Définissez clairement vos intentions',
      tips: [
        'Soyez clair sur vos objectifs matrimoniaux',
        'Mentionnez vos valeurs importantes',
        'La clarté évite les malentendus',
        'Parlez de votre vision de la relation'
      ],
      example: 'Je recherche une épouse pieuse et éduquée pour construire une famille heureuse et équilibrée, basée sur l\'amour, le respect et la foi.'
    }
  ]
};

export const useOnboardingTutorial = (currentStep: number) => {
  const [tutorialEnabled, setTutorialEnabled] = useState(true);
  const [currentTooltip, setCurrentTooltip] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tutorialCompleted = localStorage.getItem(`tutorial_completed_${user.id}`);
    if (tutorialCompleted === 'true') {
      setTutorialEnabled(false);
    }
  };

  const markFieldComplete = useCallback((fieldId: string) => {
    setCompletedFields(prev => new Set([...prev, fieldId]));
    
    const stepFields = TUTORIAL_STEPS[currentStep] || [];
    const allFieldsComplete = stepFields.every(step => 
      completedFields.has(step.id) || step.id === fieldId
    );

    if (allFieldsComplete && stepFields.length > 0) {
      triggerStepCelebration(currentStep);
    }
  }, [currentStep, completedFields]);

  const triggerStepCelebration = (step: number) => {
    const messages = [
      '🎉 Excellent début ! Continuez comme ça !',
      '✨ Bravo ! Votre profil prend forme !',
      '🌟 Fantastique ! Vous progressez bien !',
      '🎊 Super ! Presque terminé !'
    ];
    
    setCelebrationMessage(messages[step - 1] || '🎉 Félicitations !');
    setShowCelebration(true);
    
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getStepTutorials = (step: number): TutorialStep[] => {
    return TUTORIAL_STEPS[step] || [];
  };

  const showTooltip = (fieldId: string) => {
    if (tutorialEnabled) {
      setCurrentTooltip(fieldId);
    }
  };

  const hideTooltip = () => {
    setCurrentTooltip(null);
  };

  const dismissTutorial = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
    }
    setTutorialEnabled(false);
  };

  return {
    tutorialEnabled,
    currentTooltip,
    completedFields,
    showCelebration,
    celebrationMessage,
    getStepTutorials,
    showTooltip,
    hideTooltip,
    markFieldComplete,
    dismissTutorial
  };
};
