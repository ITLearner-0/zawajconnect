/**
 * Types centralisés pour le système de compatibilité
 * Élimine la duplication entre composants et hooks
 */

/**
 * Représente un domaine de compatibilité avec son score
 */
export interface CompatibilityArea {
  /** Nom du domaine de compatibilité */
  category: string;
  /** Score de compatibilité (0-100) */
  score: number;
  /** Description du domaine */
  description: string;
}

/**
 * Suggestion d'amélioration pour l'utilisateur
 */
export interface Suggestion {
  /** Titre de la suggestion */
  title: string;
  /** Description détaillée */
  description: string;
  /** Niveau de priorité */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Signal d'alerte dans le profil
 */
export interface RedFlag {
  /** Titre du signal */
  title: string;
  /** Description détaillée */
  description: string;
  /** Niveau de sévérité */
  severity: 'warning' | 'important' | 'critical';
}

/**
 * Guidance islamique contextuelle
 */
export interface IslamicGuidance {
  /** Titre de la guidance */
  title: string;
  /** Verset ou hadith */
  verse: string;
  /** Source (Coran, Hadith, etc.) */
  source: string;
  /** Application pratique */
  application: string;
}

/**
 * Insights complets de compatibilité
 */
export interface CompatibilityInsights {
  /** Résumé de la personnalité */
  summary: string;
  /** Priorités identifiées */
  priorities: string[];
  /** Style relationnel */
  relationshipStyle: string;
  /** Domaines de compatibilité analysés */
  compatibilityAreas: CompatibilityArea[];
  /** Profil du partenaire idéal */
  idealPartner: string[];
  /** Suggestions d'amélioration */
  suggestions: Suggestion[];
  /** Signaux d'alerte */
  redFlags: RedFlag[];
  /** Guidances islamiques pertinentes */
  islamicGuidance: IslamicGuidance[];
}

/**
 * Niveaux de gamification
 */
export interface GamificationLevel {
  /** Numéro du niveau */
  level: number;
  /** Titre du niveau */
  title: string;
  /** Points minimum requis */
  minPoints: number;
  /** Points maximum du niveau */
  maxPoints: number;
  /** Bénéfices débloqués */
  benefits: string[];
  /** Icône associée */
  icon: React.ReactNode;
}

/**
 * Achievement dans le système de gamification
 */
export interface Achievement {
  /** ID unique de l'achievement */
  id: string;
  /** Titre de l'achievement */
  title: string;
  /** Description */
  description: string;
  /** Icône */
  icon: React.ReactNode;
  /** État de débloquage */
  unlocked: boolean;
  /** Progression actuelle (optionnel) */
  progress?: number;
  /** Progression maximale (optionnel) */
  maxProgress?: number;
  /** Rareté */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  /** Récompense associée */
  reward: {
    type: 'points' | 'badge' | 'unlock';
    value: string;
  };
}

/**
 * Analytics des insights
 */
export interface InsightsAnalytics {
  /** Nombre de vues */
  viewCount: number;
  /** Dernière vue */
  lastViewed: string | undefined;
  /** Nombre de partages */
  shareCount: number;
  /** Nombre d'exports */
  exportCount: number;
  /** Actions effectuées */
  actionsTaken: string[];
}

/**
 * Niveau d'engagement utilisateur
 */
export type EngagementLevel = 'low' | 'medium' | 'high';

/**
 * Type d'action trackée
 */
export type InsightActionType = 
  | 'view_insights'
  | 'share_insights'
  | 'export_pdf'
  | 'complete_test'
  | 'browse_profiles'
  | 'improve_profile'
  | 'read_guidance'
  | 'retake_test'
  | 'achievement_unlocked';

/**
 * Réponse à une question du test de compatibilité
 */
export interface Answer {
  questionId: string | number;
  value: number;
  weight?: number;
  isBreaker?: boolean;
  breakerThreshold?: number;
}

/**
 * Match de compatibilité avec un autre utilisateur
 */
export interface CompatibilityMatch {
  userId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  compatibilityScore: number;
  score?: number;
  matchingAreas?: string[];
  differences?: string[];
  location?: string;
  gender?: string;
  educationLevel?: string;
  matchDetails?: {
    strengths: string[];
    challenges: string[];
    compatibility: number;
  };
  profileData?: {
    id: string;
    first_name: string;
    last_name?: string;
    gender: string;
    location?: string;
    education_level?: string;
    profile_picture?: string;
    age?: number;
    religious_practice_level?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    id_verified?: boolean;
  };
}

/**
 * Match de compatibilité avec détails enrichis
 */
export interface EnhancedCompatibilityMatch extends CompatibilityMatch {
  matchDetails: {
    strengths: string[];
    challenges: string[];
    differences: string[];
    dealbreakers?: string[];
    compatibility: number;
  };
}
