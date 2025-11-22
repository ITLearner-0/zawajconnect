/**
 * Enhanced Matching Algorithm with Fuzzy Matching
 *
 * Improves upon binary matching by introducing partial compatibility scoring
 * Addresses the issue of overly strict exact-match requirements
 */

import { logger } from './logger';
import type {
  MatchingIslamicPreferences,
  CulturalPreferences,
  CompatibilityWeights,
  CompatibilityExplanation,
} from '@/types/supabase';
import type { PersonalityQuestionnaire } from '@/types/personality';

/**
 * Re-export types for backwards compatibility
 */
export type { CompatibilityWeights, CompatibilityExplanation };

/**
 * Islamic preference compatibility levels
 */
export enum CompatibilityLevel {
  EXACT_MATCH = 1.0, // Perfect match
  HIGH = 0.8, // Very compatible
  MEDIUM = 0.6, // Somewhat compatible
  LOW = 0.3, // Minimally compatible
  NO_MATCH = 0.0, // Incompatible
}

/**
 * Calculate similarity between two string values with fuzzy matching
 */
export const calculateStringSimilarity = (str1: string | null, str2: string | null): number => {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return CompatibilityLevel.EXACT_MATCH;

  // Levenshtein distance for fuzzy matching
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return CompatibilityLevel.EXACT_MATCH;

  const editDistance = levenshteinDistance(s1, s2);
  const similarity = (longer.length - editDistance) / longer.length;

  if (similarity > 0.8) return CompatibilityLevel.HIGH;
  if (similarity > 0.6) return CompatibilityLevel.MEDIUM;
  if (similarity > 0.3) return CompatibilityLevel.LOW;
  return CompatibilityLevel.NO_MATCH;
};

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substitution
          matrix[i]![j - 1]! + 1, // insertion
          matrix[i - 1]![j]! + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length]![str1.length]!;
}

/**
 * Calculate numeric range compatibility
 */
export const calculateNumericCompatibility = (
  value1: number | null,
  value2: number | null,
  tolerance: number = 0.2
): number => {
  if (value1 === null || value2 === null) return 0;

  const diff = Math.abs(value1 - value2);
  const avg = (value1 + value2) / 2;
  const percentDiff = avg === 0 ? 0 : diff / avg;

  if (percentDiff === 0) return CompatibilityLevel.EXACT_MATCH;
  if (percentDiff <= tolerance) return CompatibilityLevel.HIGH;
  if (percentDiff <= tolerance * 2) return CompatibilityLevel.MEDIUM;
  if (percentDiff <= tolerance * 3) return CompatibilityLevel.LOW;
  return CompatibilityLevel.NO_MATCH;
};

/**
 * Calculate Islamic preference compatibility with fuzzy logic
 */
export const calculateIslamicCompatibility = (
  user1Prefs: MatchingIslamicPreferences,
  user2Prefs: MatchingIslamicPreferences
): number => {
  const scores: number[] = [];

  // Prayer frequency (critical importance)
  if (user1Prefs.prayer_frequency && user2Prefs.prayer_frequency) {
    const prayerScore = calculatePrayerCompatibility(
      user1Prefs.prayer_frequency,
      user2Prefs.prayer_frequency
    );
    scores.push(prayerScore * 2); // Double weight for prayers
  }

  // Sect compatibility (very important)
  if (user1Prefs.sect && user2Prefs.sect) {
    const sectScore =
      user1Prefs.sect === user2Prefs.sect ? CompatibilityLevel.EXACT_MATCH : CompatibilityLevel.LOW;
    scores.push(sectScore * 1.5); // 1.5x weight for sect
  }

  // Madhab compatibility (using index signature)
  const madhab1 = user1Prefs['madhab'] as string | undefined;
  const madhab2 = user2Prefs['madhab'] as string | undefined;
  if (madhab1 && madhab2) {
    const madhabScore =
      madhab1 === madhab2 ? CompatibilityLevel.EXACT_MATCH : CompatibilityLevel.MEDIUM; // Same sect but different madhab is okay
    scores.push(madhabScore);
  }

  // Quran reading habits (using index signature)
  const quran1 = user1Prefs['quran_reading'] as string | undefined;
  const quran2 = user2Prefs['quran_reading'] as string | undefined;
  if (quran1 && quran2) {
    scores.push(calculateStringSimilarity(quran1, quran2));
  }

  // Halal diet (using index signature)
  const halal1 = user1Prefs['halal_diet'] as boolean | undefined;
  const halal2 = user2Prefs['halal_diet'] as boolean | undefined;
  if (halal1 !== undefined && halal2 !== undefined) {
    const halalScore = halal1 === halal2 ? CompatibilityLevel.EXACT_MATCH : CompatibilityLevel.LOW;
    scores.push(halalScore);
  }

  // Smoking preference (using index signature)
  const smoking1 = user1Prefs['smoking'] as string | undefined;
  const smoking2 = user2Prefs['smoking'] as string | undefined;
  if (smoking1 !== undefined && smoking2 !== undefined) {
    const smokingScore =
      smoking1 === smoking2 ? CompatibilityLevel.EXACT_MATCH : CompatibilityLevel.MEDIUM; // Some flexibility
    scores.push(smokingScore);
  }

  // Importance of religion (using index signature)
  const importance1 = user1Prefs['importance_of_religion'] as number | undefined;
  const importance2 = user2Prefs['importance_of_religion'] as number | undefined;
  if (importance1 !== undefined && importance2 !== undefined) {
    scores.push(
      calculateNumericCompatibility(
        importance1,
        importance2,
        0.15 // 15% tolerance
      )
    );
  }

  // Hijab/Beard preferences (appearance - using index signature)
  const hijab1 = user1Prefs['hijab_wearing'] as string | undefined;
  const beard2 = user2Prefs['beard_preference'] as string | undefined;
  if (hijab1 && beard2) {
    // Cross-gender appearance compatibility
    scores.push(calculateAppearanceCompatibility(hijab1, beard2));
  }

  if (scores.length === 0) {
    logger.warn('No Islamic preferences available for matching');
    return 30; // Low score for incomplete profiles to encourage completion
  }

  // Calculate total weight used
  let totalWeight = 0;
  if (user1Prefs.prayer_frequency && user2Prefs.prayer_frequency) totalWeight += 2;
  if (user1Prefs.sect && user2Prefs.sect) totalWeight += 1.5;
  if (madhab1 && madhab2) totalWeight += 1;
  if (quran1 && quran2) totalWeight += 1;
  if (halal1 !== undefined && halal2 !== undefined) totalWeight += 1;
  if (smoking1 !== undefined && smoking2 !== undefined) totalWeight += 1;
  if (importance1 !== undefined && importance2 !== undefined) totalWeight += 1;
  if (hijab1 && beard2) totalWeight += 1;

  // Weighted average normalized to 0-1, then scale to 0-100
  const totalScore = scores.reduce((sum: number, score: number) => sum + score, 0);
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  return Math.round(normalizedScore * 100);
};

/**
 * Calculate prayer frequency compatibility with granularity
 */
const calculatePrayerCompatibility = (freq1: string, freq2: string): number => {
  const prayerLevels: Record<string, number> = {
    five_times_daily: 5,
    regularly: 4,
    sometimes: 3,
    rarely: 2,
    never: 1,
  };

  const level1 = prayerLevels[freq1.toLowerCase()] ?? 0;
  const level2 = prayerLevels[freq2.toLowerCase()] ?? 0;

  const diff = Math.abs(level1 - level2);

  if (diff === 0) return CompatibilityLevel.EXACT_MATCH;
  if (diff === 1) return CompatibilityLevel.HIGH;
  if (diff === 2) return CompatibilityLevel.MEDIUM;
  return CompatibilityLevel.LOW;
};

/**
 * Calculate appearance preference compatibility
 */
const calculateAppearanceCompatibility = (hijabPref: string, beardPref: string): number => {
  // Conservative preferences align
  const conservative = ['always', 'full', 'traditional'];
  const moderate = ['sometimes', 'partial', 'trimmed'];
  const flexible = ['rarely', 'optional', 'clean_shaven'];

  const hijabLevel = conservative.some((c) => hijabPref.toLowerCase().includes(c))
    ? 'conservative'
    : moderate.some((m) => hijabPref.toLowerCase().includes(m))
      ? 'moderate'
      : 'flexible';

  const beardLevel = conservative.some((c) => beardPref.toLowerCase().includes(c))
    ? 'conservative'
    : moderate.some((m) => beardPref.toLowerCase().includes(m))
      ? 'moderate'
      : 'flexible';

  if (hijabLevel === beardLevel) return CompatibilityLevel.EXACT_MATCH;
  if (
    (hijabLevel === 'conservative' && beardLevel === 'moderate') ||
    (hijabLevel === 'moderate' && beardLevel === 'conservative') ||
    (hijabLevel === 'moderate' && beardLevel === 'flexible') ||
    (hijabLevel === 'flexible' && beardLevel === 'moderate')
  ) {
    return CompatibilityLevel.HIGH;
  }

  return CompatibilityLevel.MEDIUM;
};

/**
 * Calculate cultural compatibility with partial matching
 */
export const calculateCulturalCompatibility = (
  user1Prefs: CulturalPreferences,
  user2Prefs: CulturalPreferences
): number => {
  const scores: number[] = [];

  // Location similarity (same city = high, same country = medium, etc.)
  if (user1Prefs.location && user2Prefs.location) {
    scores.push(calculateStringSimilarity(user1Prefs.location, user2Prefs.location));
  }

  // Education level compatibility
  if (user1Prefs.education_level && user2Prefs.education_level) {
    scores.push(
      calculateEducationCompatibility(user1Prefs.education_level, user2Prefs.education_level)
    );
  }

  // Profession compatibility (similar fields)
  if (user1Prefs.profession && user2Prefs.profession) {
    scores.push(calculateStringSimilarity(user1Prefs.profession, user2Prefs.profession));
  }

  // Interests overlap
  if (user1Prefs.interests && user2Prefs.interests) {
    scores.push(calculateArrayOverlap(user1Prefs.interests, user2Prefs.interests));
  }

  // Language compatibility
  if (user1Prefs.languages && user2Prefs.languages) {
    scores.push(calculateArrayOverlap(user1Prefs.languages, user2Prefs.languages));
  }

  if (scores.length === 0) return 60;

  // Calculate average score (already in 0-1 range from CompatibilityLevel enum)
  const averageScore =
    scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;

  // Scale to 0-100
  return Math.round(averageScore * 100);
};

/**
 * Calculate education level compatibility
 */
const calculateEducationCompatibility = (edu1: string, edu2: string): number => {
  const educationLevels: Record<string, number> = {
    doctorate: 6,
    masters: 5,
    bachelors: 4,
    associates: 3,
    high_school: 2,
    some_high_school: 1,
  };

  const level1 = educationLevels[edu1.toLowerCase().replace(/\s/g, '_')] ?? 0;
  const level2 = educationLevels[edu2.toLowerCase().replace(/\s/g, '_')] ?? 0;

  const diff = Math.abs(level1 - level2);

  if (diff === 0) return CompatibilityLevel.EXACT_MATCH;
  if (diff === 1) return CompatibilityLevel.HIGH;
  if (diff === 2) return CompatibilityLevel.MEDIUM;
  return CompatibilityLevel.LOW;
};

/**
 * Calculate overlap between two arrays (interests, languages, etc.)
 */
const calculateArrayOverlap = (arr1: string[], arr2: string[]): number => {
  if (arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1.map((item: string) => item.toLowerCase().trim()));
  const set2 = new Set(arr2.map((item: string) => item.toLowerCase().trim()));

  const intersection = new Set([...set1].filter((x: string) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const jaccardIndex = intersection.size / union.size;

  if (jaccardIndex >= 0.7) return CompatibilityLevel.EXACT_MATCH;
  if (jaccardIndex >= 0.5) return CompatibilityLevel.HIGH;
  if (jaccardIndex >= 0.3) return CompatibilityLevel.MEDIUM;
  if (jaccardIndex >= 0.1) return CompatibilityLevel.LOW;
  return CompatibilityLevel.NO_MATCH;
};

/**
 * Calculate overall compatibility score with weighted dimensions
 * Default weights: Islamic 50%, Cultural 40%, Personality 10%
 * Note: Personality weight is low since it's currently a placeholder
 */
export const calculateOverallCompatibility = (
  islamicScore: number,
  culturalScore: number,
  personalityScore: number,
  weights: CompatibilityWeights = { islamic: 0.5, cultural: 0.4, personality: 0.1 }
): number => {
  // Normalize weights to sum to 1
  const totalWeight = weights.islamic + weights.cultural + weights.personality;
  const normalizedWeights: CompatibilityWeights = {
    islamic: weights.islamic / totalWeight,
    cultural: weights.cultural / totalWeight,
    personality: weights.personality / totalWeight,
  };

  const overallScore =
    islamicScore * normalizedWeights.islamic +
    culturalScore * normalizedWeights.cultural +
    personalityScore * normalizedWeights.personality;

  return Math.round(Math.max(0, Math.min(100, overallScore)));
};

/**
 * Generate compatibility explanation for users
 */
export const generateCompatibilityExplanation = (
  islamicScore: number,
  culturalScore: number,
  personalityScore: number
): CompatibilityExplanation => {
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Identify strengths
  if (islamicScore >= 85) {
    strengths.push('Excellente compatibilité religieuse');
  } else if (islamicScore >= 70) {
    strengths.push('Bonne compatibilité religieuse');
  }

  if (culturalScore >= 85) {
    strengths.push('Excellente compatibilité culturelle');
  } else if (culturalScore >= 70) {
    strengths.push('Bonne compatibilité culturelle');
  }

  if (personalityScore >= 85) {
    strengths.push('Excellente compatibilité de personnalité');
  } else if (personalityScore >= 70) {
    strengths.push('Bonne compatibilité de personnalité');
  }

  // Identify concerns
  if (islamicScore < 60) {
    concerns.push('Différences dans la pratique religieuse');
  } else if (islamicScore < 70) {
    concerns.push('Quelques différences religieuses à considérer');
  }

  if (culturalScore < 50) {
    concerns.push('Origines culturelles différentes');
  } else if (culturalScore < 60) {
    concerns.push('Quelques différences culturelles');
  }

  if (personalityScore < 50) {
    concerns.push('Personnalités potentiellement incompatibles');
  } else if (personalityScore < 60) {
    concerns.push('Quelques différences de personnalité');
  }

  // Generate summary
  let summary = '';
  if (strengths.length > 0) {
    summary += `Points forts: ${strengths.join(', ')}. `;
  }
  if (concerns.length > 0) {
    summary += `Points à considérer: ${concerns.join(', ')}.`;
  } else if (strengths.length === 0) {
    summary = 'Compatibilité modérée dans tous les domaines.';
  }

  return {
    strengths,
    concerns,
    summary: summary.trim(),
  };
};

/**
 * Calculate personality compatibility based on questionnaire responses
 * Uses weighted scoring for different personality dimensions
 *
 * Compatibility factors:
 * - Complementary traits (opposites attract) for some dimensions
 * - Similar traits (birds of a feather) for others
 * - Weighted importance based on relationship research
 */
export const calculatePersonalityCompatibility = (
  user1Prefs: PersonalityQuestionnaire | null,
  user2Prefs: PersonalityQuestionnaire | null
): number => {
  if (!user1Prefs || !user2Prefs) {
    logger.warn('Missing personality questionnaire data');
    return 70; // Default score when data is missing
  }

  const scores: { score: number; weight: number }[] = [];

  // Life Goals & Ambitions (Should be SIMILAR - high weight)
  // People with similar life goals have more successful relationships
  scores.push({
    score: calculateSimilarityScore(user1Prefs.career_ambition, user2Prefs.career_ambition),
    weight: 1.5, // High importance
  });
  scores.push({
    score: calculateSimilarityScore(user1Prefs.family_priority, user2Prefs.family_priority),
    weight: 2.0, // Very high importance - critical in marriage
  });
  scores.push({
    score: calculateSimilarityScore(user1Prefs.religious_growth, user2Prefs.religious_growth),
    weight: 1.8, // Very high importance - spiritual alignment
  });
  scores.push({
    score: calculateSimilarityScore(user1Prefs.community_involvement, user2Prefs.community_involvement),
    weight: 1.0,
  });

  // Communication & Conflict Resolution (MODERATE BALANCE)
  // Some difference is okay, but extremes are problematic
  scores.push({
    score: calculateBalancedScore(user1Prefs.communication_style, user2Prefs.communication_style),
    weight: 1.5, // Important for daily interaction
  });
  scores.push({
    score: calculateBalancedScore(user1Prefs.conflict_resolution, user2Prefs.conflict_resolution),
    weight: 1.7, // Very important - conflict management is key
  });
  scores.push({
    score: calculateBalancedScore(user1Prefs.emotional_expression, user2Prefs.emotional_expression),
    weight: 1.2,
  });

  // Financial Management (Should be SIMILAR - high weight)
  // Financial disagreements are a top cause of relationship stress
  scores.push({
    score: calculateSimilarityScore(user1Prefs.spending_habits, user2Prefs.spending_habits),
    weight: 1.6, // High importance
  });
  scores.push({
    score: calculateSimilarityScore(user1Prefs.financial_planning, user2Prefs.financial_planning),
    weight: 1.6, // High importance
  });

  // Social & Lifestyle (MODERATE BALANCE or COMPLEMENTARY)
  // Some difference adds richness, but extreme gaps cause issues
  scores.push({
    score: calculateBalancedScore(user1Prefs.social_energy, user2Prefs.social_energy),
    weight: 1.1,
  });
  scores.push({
    score: calculateBalancedScore(user1Prefs.adventure_level, user2Prefs.adventure_level),
    weight: 1.0,
  });
  scores.push({
    score: calculateComplementaryScore(user1Prefs.organization_level, user2Prefs.organization_level),
    weight: 0.9, // Can be complementary - one organized, one spontaneous
  });

  // Family Roles & Responsibilities (Should be SIMILAR - critical)
  // Alignment on family values is essential for long-term harmony
  scores.push({
    score: calculateSimilarityScore(user1Prefs.household_roles, user2Prefs.household_roles),
    weight: 1.8, // Very important
  });
  scores.push({
    score: calculateSimilarityScore(user1Prefs.decision_making, user2Prefs.decision_making),
    weight: 1.5, // Important
  });
  scores.push({
    score: calculateSimilarityScore(user1Prefs.parenting_style, user2Prefs.parenting_style),
    weight: 1.7, // Very important for future family
  });

  // Calculate weighted average
  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = scores.reduce((sum, item) => sum + item.score * item.weight, 0);
  const normalizedScore = weightedSum / totalWeight;

  // Scale to 0-100
  return Math.round(normalizedScore * 100);
};

/**
 * Calculate similarity score (1-5 scale) - higher score when values are closer
 * Used for traits that should match (e.g., family priorities, religious goals)
 */
const calculateSimilarityScore = (value1: number, value2: number): number => {
  const difference = Math.abs(value1 - value2);

  // Perfect match
  if (difference === 0) return CompatibilityLevel.EXACT_MATCH;

  // 1 point difference
  if (difference === 1) return CompatibilityLevel.HIGH;

  // 2 points difference
  if (difference === 2) return CompatibilityLevel.MEDIUM;

  // 3 points difference
  if (difference === 3) return CompatibilityLevel.LOW;

  // 4 points difference (maximum)
  return CompatibilityLevel.NO_MATCH;
};

/**
 * Calculate balanced score - prefers moderate alignment
 * Used for communication traits where some difference is okay but extremes are problematic
 */
const calculateBalancedScore = (value1: number, value2: number): number => {
  const difference = Math.abs(value1 - value2);

  // Perfect or close match is good
  if (difference <= 1) return CompatibilityLevel.EXACT_MATCH;

  // Moderate difference is acceptable
  if (difference === 2) return CompatibilityLevel.HIGH;

  // Larger differences are less ideal
  if (difference === 3) return CompatibilityLevel.MEDIUM;

  // Extreme difference
  return CompatibilityLevel.LOW;
};

/**
 * Calculate complementary score - allows for differences
 * Used for traits that can complement each other (e.g., one organized, one spontaneous)
 */
const calculateComplementaryScore = (value1: number, value2: number): number => {
  const difference = Math.abs(value1 - value2);

  // Moderate difference can be complementary
  if (difference >= 1 && difference <= 2) return CompatibilityLevel.EXACT_MATCH;

  // Same or very similar is also good
  if (difference === 0) return CompatibilityLevel.HIGH;

  // Larger difference is acceptable
  if (difference === 3) return CompatibilityLevel.MEDIUM;

  // Extreme difference
  return CompatibilityLevel.LOW;
};
