/**
 * Types réutilisables extraits de la base de données Supabase
 * et des hooks de l'application.
 * 
 * Ce fichier centralise les types pour éviter la duplication
 * et améliorer la maintenabilité du code.
 */

import type { Database } from '@/integrations/supabase/types';

// ============================================================================
// TYPES EXTRAITS DES TABLES SUPABASE
// ============================================================================

/**
 * Types de base extraits directement des tables Supabase
 */
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type IslamicPreferencesRow = Database['public']['Tables']['islamic_preferences']['Row'];
export type PrivacySettingsRow = Database['public']['Tables']['privacy_settings']['Row'];
export type UserVerificationRow = Database['public']['Tables']['user_verifications']['Row'];
export type MatchingPreferencesRow = Database['public']['Tables']['matching_preferences']['Row'];
export type MatchRow = Database['public']['Tables']['matches']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type FamilyMemberRow = Database['public']['Tables']['family_members']['Row'];
export type FamilyNotificationRow = Database['public']['Tables']['family_notifications']['Row'];
export type FamilyReviewRow = Database['public']['Tables']['family_reviews']['Row'];
export type CompatibilityQuestionRow = Database['public']['Tables']['compatibility_questions']['Row'];
export type UserCompatibilityResponseRow = Database['public']['Tables']['user_compatibility_responses']['Row'];
export type ProfileViewRow = Database['public']['Tables']['profile_views']['Row'];

/**
 * Types Insert pour les opérations d'insertion/upsert
 */
export type FamilyReviewInsert = Database['public']['Tables']['family_reviews']['Insert'];

// ============================================================================
// TYPES DE PRÉFÉRENCES DE MATCHING
// ============================================================================

/**
 * Type pour la mise à jour des préférences de matching
 * (sans les champs générés automatiquement)
 */
export type MatchingPreferencesUpdate = Omit<
  MatchingPreferencesRow, 
  'id' | 'created_at' | 'updated_at' | 'user_id'
>;

// ============================================================================
// TYPES DE COMPATIBILITÉ
// ============================================================================

/**
 * Réponse utilisateur pour une question de compatibilité
 */
export interface CompatibilityResponse {
  question_key: string;
  response_value: string;
  updated_at?: string;
}

/**
 * Statistiques de complétion du questionnaire de compatibilité
 */
export interface CompatibilityStats {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  lastUpdated: string | null;
}

/**
 * Question de compatibilité avec son poids
 */
export interface WeightedQuestion {
  question_key: string;
  weight: number;
}

// ============================================================================
// TYPES D'APPROBATION FAMILIALE
// ============================================================================

/**
 * Profil partiel pour l'affichage des matches
 */
export interface MatchProfileData {
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url: string;
}

/**
 * Match enrichi avec les profils utilisateurs
 * Compatible avec les composants d'affichage
 */
export interface EnrichedMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  user1_profile?: MatchProfileData | null;
  user2_profile?: MatchProfileData | null;
}

/**
 * Notification familiale enrichie avec les données du match
 * Utilisée dans les composants d'approbation familiale
 */
export interface EnrichedFamilyNotification {
  id: string;
  match_id: string;
  notification_type: string;
  content: string;
  severity: string;
  action_required: boolean;
  is_read: boolean;
  created_at: string;
  family_member_id: string;
  original_message: string | null;
  read_at: string | null;
  match?: EnrichedMatch | null;
}

// ============================================================================
// TYPES DE VALIDATION DE SÉCURITÉ
// ============================================================================

/**
 * Structure de vérification utilisateur retournée par RPC
 */
export interface UserVerificationStatus {
  email_verified: boolean;
  id_verified: boolean;
  verification_score: number;
}

/**
 * Informations additionnelles pour les résultats de validation
 */
export interface ValidationAdditionalInfo {
  daily_limit?: number;
  current_count?: number;
  hourly_limit?: number;
  operation_type?: string;
  verification_score?: number;
  required_score?: number;
}

/**
 * Résultat d'une validation de sécurité
 */
export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  requiredScore?: number;
  currentScore?: number;
  additionalInfo?: ValidationAdditionalInfo;
}

/**
 * Interface du hook de validation de sécurité
 */
export interface SecurityValidationHook {
  validateFamilyOperationEnhanced: (operationType: string, requiredScore?: number) => Promise<ValidationResult>;
  validateMessagePermissionsEnhanced: (matchId: string, requiredScore?: number) => Promise<ValidationResult>;
  validateProfileAccessEnhanced: (targetUserId: string, requiredScore?: number) => Promise<ValidationResult>;
  validateContactInfoAccess: (familyMemberId: string) => Promise<ValidationResult>;
  validateWithFeedback: (validationFn: () => Promise<ValidationResult>) => Promise<boolean>;
  showValidationError: (result: ValidationResult) => void;
  validating: boolean;
}

// ============================================================================
// TYPES DE PROFIL UTILISATEUR
// ============================================================================

/**
 * Données complètes du profil utilisateur
 * Utilisé dans useProfileData
 */
export interface ProfileData {
  profile: ProfileRow | null;
  islamicPreferences: IslamicPreferencesRow | null;
  privacySettings: PrivacySettingsRow | null;
  verification: UserVerificationRow | null;
  matchingPreferences: MatchingPreferencesRow | null;
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

/**
 * Type utilitaire pour les valeurs nullables
 */
export type Nullable<T> = T | null;

/**
 * Type utilitaire pour les valeurs optionnelles
 */
export type Optional<T> = T | undefined;

/**
 * Type utilitaire pour un objet partiel récursif
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
