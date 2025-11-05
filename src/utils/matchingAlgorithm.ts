/**
 * Enhanced Matching Algorithm with Fuzzy Matching
 *
 * Improves upon binary matching by introducing partial compatibility scoring
 * Addresses the issue of overly strict exact-match requirements
 */

import { logger } from './logger';

/**
 * Islamic preference compatibility levels
 */
export enum CompatibilityLevel {
  EXACT_MATCH = 1.0,      // Perfect match
  HIGH = 0.8,              // Very compatible
  MEDIUM = 0.6,            // Somewhat compatible
  LOW = 0.3,               // Minimally compatible
  NO_MATCH = 0.0,          // Incompatible
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
          matrix[i]![j - 1]! + 1,     // insertion
          matrix[i - 1]![j]! + 1      // deletion
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
interface IslamicPreferences {
  prayer_frequency?: string | null;
  quran_reading?: string | null;
  sect?: string | null;
  madhab?: string | null;
  hijab_wearing?: string | null;
  beard_preference?: string | null;
  halal_diet?: boolean | null;
  smoking?: boolean | null;
  importance_of_religion?: number | null;
}

export const calculateIslamicCompatibility = (
  user1Prefs: IslamicPreferences,
  user2Prefs: IslamicPreferences
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
    const sectScore = user1Prefs.sect === user2Prefs.sect
      ? CompatibilityLevel.EXACT_MATCH
      : CompatibilityLevel.LOW;
    scores.push(sectScore * 1.5); // 1.5x weight for sect
  }

  // Madhab compatibility
  if (user1Prefs.madhab && user2Prefs.madhab) {
    const madhabScore = user1Prefs.madhab === user2Prefs.madhab
      ? CompatibilityLevel.EXACT_MATCH
      : CompatibilityLevel.MEDIUM; // Same sect but different madhab is okay
    scores.push(madhabScore);
  }

  // Quran reading habits
  if (user1Prefs.quran_reading && user2Prefs.quran_reading) {
    scores.push(
      calculateStringSimilarity(user1Prefs.quran_reading, user2Prefs.quran_reading)
    );
  }

  // Halal diet (boolean exact match)
  if (user1Prefs.halal_diet !== null && user2Prefs.halal_diet !== null) {
    const halalScore = user1Prefs.halal_diet === user2Prefs.halal_diet
      ? CompatibilityLevel.EXACT_MATCH
      : CompatibilityLevel.LOW;
    scores.push(halalScore);
  }

  // Smoking preference (important for health)
  if (user1Prefs.smoking !== null && user2Prefs.smoking !== null) {
    const smokingScore = user1Prefs.smoking === user2Prefs.smoking
      ? CompatibilityLevel.EXACT_MATCH
      : CompatibilityLevel.MEDIUM; // Some flexibility
    scores.push(smokingScore);
  }

  // Importance of religion (numeric range)
  if (user1Prefs.importance_of_religion && user2Prefs.importance_of_religion) {
    scores.push(
      calculateNumericCompatibility(
        user1Prefs.importance_of_religion,
        user2Prefs.importance_of_religion,
        0.15 // 15% tolerance
      )
    );
  }

  // Hijab/Beard preferences (appearance)
  if (user1Prefs.hijab_wearing && user2Prefs.beard_preference) {
    // Cross-gender appearance compatibility
    scores.push(
      calculateAppearanceCompatibility(
        user1Prefs.hijab_wearing,
        user2Prefs.beard_preference
      )
    );
  }

  if (scores.length === 0) {
    logger.warn('No Islamic preferences available for matching');
    return 60; // Default neutral score
  }

  // Calculate total weight used
  let totalWeight = 0;
  if (user1Prefs.prayer_frequency && user2Prefs.prayer_frequency) totalWeight += 2;
  if (user1Prefs.sect && user2Prefs.sect) totalWeight += 1.5;
  if (user1Prefs.madhab && user2Prefs.madhab) totalWeight += 1;
  if (user1Prefs.quran_reading && user2Prefs.quran_reading) totalWeight += 1;
  if (user1Prefs.halal_diet !== null && user2Prefs.halal_diet !== null) totalWeight += 1;
  if (user1Prefs.smoking !== null && user2Prefs.smoking !== null) totalWeight += 1;
  if (user1Prefs.importance_of_religion && user2Prefs.importance_of_religion) totalWeight += 1;
  if (user1Prefs.hijab_wearing && user2Prefs.beard_preference) totalWeight += 1;

  // Weighted average normalized to 0-1, then scale to 0-100
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  return Math.round(normalizedScore * 100);
};

/**
 * Calculate prayer frequency compatibility with granularity
 */
const calculatePrayerCompatibility = (freq1: string, freq2: string): number => {
  const prayerLevels: { [key: string]: number } = {
    'five_times_daily': 5,
    'regularly': 4,
    'sometimes': 3,
    'rarely': 2,
    'never': 1,
  };

  const level1 = prayerLevels[freq1.toLowerCase()] || 0;
  const level2 = prayerLevels[freq2.toLowerCase()] || 0;

  const diff = Math.abs(level1 - level2);

  if (diff === 0) return CompatibilityLevel.EXACT_MATCH;
  if (diff === 1) return CompatibilityLevel.HIGH;
  if (diff === 2) return CompatibilityLevel.MEDIUM;
  return CompatibilityLevel.LOW;
};

/**
 * Calculate appearance preference compatibility
 */
const calculateAppearanceCompatibility = (
  hijabPref: string,
  beardPref: string
): number => {
  // Conservative preferences align
  const conservative = ['always', 'full', 'traditional'];
  const moderate = ['sometimes', 'partial', 'trimmed'];
  const flexible = ['rarely', 'optional', 'clean_shaven'];

  const hijabLevel = conservative.some(c => hijabPref.toLowerCase().includes(c))
    ? 'conservative'
    : moderate.some(m => hijabPref.toLowerCase().includes(m))
    ? 'moderate'
    : 'flexible';

  const beardLevel = conservative.some(c => beardPref.toLowerCase().includes(c))
    ? 'conservative'
    : moderate.some(m => beardPref.toLowerCase().includes(m))
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
interface CulturalPreferences {
  location?: string | null;
  education_level?: string | null;
  profession?: string | null;
  interests?: string[] | null;
  languages?: string[] | null;
}

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
      calculateEducationCompatibility(
        user1Prefs.education_level,
        user2Prefs.education_level
      )
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
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Scale to 0-100
  return Math.round(averageScore * 100);
};

/**
 * Calculate education level compatibility
 */
const calculateEducationCompatibility = (edu1: string, edu2: string): number => {
  const educationLevels: { [key: string]: number } = {
    'doctorate': 6,
    'masters': 5,
    'bachelors': 4,
    'associates': 3,
    'high_school': 2,
    'some_high_school': 1,
  };

  const level1 = educationLevels[edu1.toLowerCase().replace(/\s/g, '_')] || 0;
  const level2 = educationLevels[edu2.toLowerCase().replace(/\s/g, '_')] || 0;

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

  const set1 = new Set(arr1.map(item => item.toLowerCase().trim()));
  const set2 = new Set(arr2.map(item => item.toLowerCase().trim()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
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
 */
interface CompatibilityWeights {
  islamic: number;
  cultural: number;
  personality: number;
}

export const calculateOverallCompatibility = (
  islamicScore: number,
  culturalScore: number,
  personalityScore: number,
  weights: CompatibilityWeights = { islamic: 0.4, cultural: 0.3, personality: 0.3 }
): number => {
  // Normalize weights to sum to 1
  const totalWeight = weights.islamic + weights.cultural + weights.personality;
  const normalizedWeights = {
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
export interface CompatibilityExplanation {
  strengths: string[];
  concerns: string[];
  summary: string;
}

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
