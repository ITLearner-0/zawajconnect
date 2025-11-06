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

// ============================================================================
// TYPES DE MODÉRATION DE CONTENU
// ============================================================================

/**
 * Types de règles de modération
 */
export type ModerationRuleType = 'keyword' | 'pattern' | 'length' | 'format' | 'content_type';

/**
 * Niveaux de sévérité de modération
 */
export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Actions de modération possibles
 */
export type ModerationAction = 'warn' | 'block' | 'escalate' | 'auto_moderate';

/**
 * Actions prises après modération
 */
export type ModerationActionTaken = 'approved' | 'warned' | 'blocked' | 'escalated' | 'auto_moderated';

/**
 * Types de contenu modéré
 */
export type ModerationContentType = 'message' | 'profile' | 'bio' | 'photo' | 'comment';

/**
 * Règle de modération typée strictement
 */
export interface ModerationRule {
  id: string;
  rule_type: ModerationRuleType;
  pattern: string;
  severity: ModerationSeverity;
  action: ModerationAction;
  is_active: boolean;
  description: string;
}

/**
 * Row de règle de modération depuis la DB
 */
export interface ModerationRuleRow {
  id: string;
  rule_type: string;
  pattern: string;
  severity: string;
  action: string;
  is_active: boolean;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Violation de modération typée strictement
 */
export interface ModerationViolation {
  user_id: string;
  content: string;
  content_type: ModerationContentType;
  rules_violated: string[];
  severity: ModerationSeverity;
  action_taken: Exclude<ModerationActionTaken, 'approved'>;
  auto_moderated_content?: string;
  created_at: string;
}

/**
 * Row de violation de modération depuis la DB
 */
export interface ModerationViolationRow {
  id: string;
  user_id: string;
  content: string;
  content_type: string;
  rules_violated: string[];
  severity: string;
  action_taken: string;
  auto_moderated_content?: string | null;
  created_at: string;
}

/**
 * Insert pour violation de modération
 */
export interface ModerationViolationInsert {
  user_id: string;
  content: string;
  content_type: string;
  rules_violated: string[];
  severity: string;
  action_taken: string;
  auto_moderated_content?: string;
}

/**
 * Résultat d'analyse de modération
 */
export interface ModerationResult {
  approved: boolean;
  action: ModerationActionTaken;
  moderatedContent?: string;
  violations: string[];
  severity: ModerationSeverity | null;
  reason: string;
}

/**
 * Suggestion de modération pour améliorer un message
 */
export interface ModerationSuggestion {
  id: string;
  original_message: string;
  suggested_message: string;
  improvement_reason: string;
  islamic_guidance: string;
  created_at: string;
}

// ============================================================================
// MATCHING UI TYPES
// ============================================================================

/**
 * Match Profile - Extended from ScoredMatch for UI display
 * Used by: MatchCard, MatchResultsGrid, useMatchingHistory
 * Includes aliases for backward compatibility
 */
export interface MatchProfile extends ScoredMatch {
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  bio?: string;
  // Aliases for compatibility
  matching_reasons: string[];
  potential_concerns: string[];
}

/**
 * Smart Recommendation - Extended match with ML insights
 * Used by: RecommendationCard, useSmartRecommendations
 */
export interface SmartRecommendation extends Omit<ScoredMatch, 'compatibility_reasons'> {
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  recommendation_score: number;
  islamic_alignment: number;
  personality_match: number;
  shared_interests: string[];
  recommendation_reasons: string[];
  growth_potential: number;
  relationship_timeline: string;
  success_probability: number;
}

/**
 * Matching History Preferences
 * Structured preferences used for matching
 */
export interface MatchingHistoryPreferences {
  age_min?: number;
  age_max?: number;
  location?: string;
  education_level?: string;
  profession?: string;
  sect?: string;
  prayer_frequency?: string;
  hijab_preference?: string;
  [key: string]: unknown;
}

/**
 * Statistiques de modération par catégorie
 */
export interface ModerationStatsBySeverity {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

/**
 * Statistiques de modération par type de contenu
 */
export interface ModerationStatsByContentType {
  message: number;
  profile: number;
  bio: number;
  photo: number;
  comment: number;
}

/**
 * Statistiques globales de modération
 */
export interface ModerationStats {
  total_checks: number;
  violations_found: number;
  content_blocked: number;
  users_warned: number;
  escalations: number;
  auto_moderated: number;
  by_severity: ModerationStatsBySeverity;
  by_content_type: ModerationStatsByContentType;
}

// ============================================================================
// TYPES DE MATCHING ET COMPATIBILITÉ (Service)
// ============================================================================

/**
 * Filtres de recherche de matches
 */
export interface MatchFilters {
  minAge?: number;
  maxAge?: number;
  location?: string;
  education?: string;
  sect?: string;
  minCompatibility?: number;
}

/**
 * Profil normalisé pour le matching
 */
export interface MatchingProfile {
  user_id: string;
  full_name?: string;
  age?: number;
  gender?: string;
  location?: string;
  education?: string;
  profession?: string;
  bio?: string;
  interests?: string[];
  avatar_url?: string;
}

/**
 * Préférences islamiques normalisées pour le matching
 */
export interface MatchingIslamicPreferences {
  user_id?: string;
  prayer_frequency?: string;
  sect?: string;
  hijab_preference?: string;
  religious_level?: string;
  [key: string]: unknown;
}

/**
 * Données de vérification utilisateur
 */
export interface UserVerificationData {
  user_id: string;
  verification_score: number;
}

/**
 * Match avec score de compatibilité calculé
 */
export interface ScoredMatch extends MatchingProfile {
  compatibility_score: number;
  islamic_score: number;
  cultural_score: number;
  personality_score: number;
  shared_interests: string[];
  compatibility_reasons: string[];
  verification_score: number;
}

/**
 * Match en cache avec métadonnées
 */
export interface CachedMatch {
  profileId: string;
  score: number;
  calculatedAt: Date;
  expiresAt: Date;
}

/**
 * Statistiques du cache de matching
 */
export interface MatchingCacheStats {
  totalEntries: number;
  totalMatches: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

/**
 * Préférences culturelles pour le matching
 */
export interface CulturalPreferences {
  location?: string | null;
  education_level?: string | null;
  profession?: string | null;
  interests?: string[] | null;
  languages?: string[] | null;
}

/**
 * Poids des dimensions de compatibilité
 */
export interface CompatibilityWeights {
  islamic: number;
  cultural: number;
  personality: number;
}

/**
 * Explication de compatibilité pour les utilisateurs
 */
export interface CompatibilityExplanation {
  strengths: string[];
  concerns: string[];
  summary: string;
}

/**
 * Profil de rôle utilisateur pour le matching
 */
export interface UserMatchingRole {
  isWali: boolean;
  hasCompleteProfile: boolean;
  canBeMatched: boolean;
  profile?: {
    gender?: string;
    age?: number;
    bio?: string;
  };
}

/**
 * Options pour la récupération de profils
 */
export interface FetchMatchingProfilesOptions {
  limit?: number;
  select?: string;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}
