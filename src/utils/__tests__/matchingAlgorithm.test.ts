/**
 * Tests for Fuzzy Matching Algorithm
 */

import { describe, it, expect } from 'vitest';
import {
  calculateIslamicCompatibility,
  calculateCulturalCompatibility,
  calculateOverallCompatibility,
  generateCompatibilityExplanation,
} from '../matchingAlgorithm';

describe('matchingAlgorithm', () => {
  describe('calculateIslamicCompatibility', () => {
    it('should return perfect score for identical preferences', () => {
      const prefs1 = {
        prayer_frequency: 'five_times_daily',
        sect: 'sunni',
        madhab: 'hanafi',
        quran_reading: 'daily',
        halal_diet: true,
        smoking: false,
      };

      const prefs2 = { ...prefs1 };

      const score = calculateIslamicCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(95); // Should be nearly perfect (out of 100)
    });

    it('should handle similar but not identical prayer frequencies', () => {
      const prefs1 = {
        prayer_frequency: 'five_times_daily',
        sect: 'sunni',
        madhab: 'hanafi',
      };

      const prefs2 = {
        prayer_frequency: 'sometimes',
        sect: 'sunni',
        madhab: 'hanafi',
      };

      const score = calculateIslamicCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(50); // Should have moderate compatibility
      expect(score).toBeLessThan(90); // But not perfect
    });

    it('should handle different sects appropriately', () => {
      const prefs1 = {
        prayer_frequency: 'five_times_daily',
        sect: 'sunni',
      };

      const prefs2 = {
        prayer_frequency: 'five_times_daily',
        sect: 'shia',
      };

      const score = calculateIslamicCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(40); // Some compatibility due to prayer
      expect(score).toBeLessThan(90); // But not excellent due to sect difference
    });

    it('should handle missing preferences gracefully', () => {
      const prefs1 = {
        prayer_frequency: 'five_times_daily',
      };

      const prefs2 = {
        prayer_frequency: 'sometimes', // Different to avoid perfect score
      };

      const score = calculateIslamicCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(0); // Should still compute a score
      expect(score).toBeLessThan(100); // Not perfect due to difference and limited data
    });

    it('should penalize smoking mismatch', () => {
      const prefs1 = {
        prayer_frequency: 'five_times_daily',
        smoking: false,
      };

      const prefs2 = {
        prayer_frequency: 'five_times_daily',
        smoking: true,
      };

      const score = calculateIslamicCompatibility(prefs1, prefs2);

      const prefs3 = {
        prayer_frequency: 'five_times_daily',
        smoking: false,
      };

      const score2 = calculateIslamicCompatibility(prefs1, prefs3);
      expect(score).toBeLessThan(score2); // Smoking mismatch should lower score
    });
  });

  describe('calculateCulturalCompatibility', () => {
    it('should return high score for similar locations', () => {
      const prefs1 = {
        location: 'Paris, France',
        education_level: 'Masters',
        interests: ['reading', 'travel', 'cooking'],
      };

      const prefs2 = {
        location: 'Paris, France',
        education_level: 'Bachelors',
        interests: ['reading', 'sports', 'cooking'],
      };

      const score = calculateCulturalCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(60); // Should have good compatibility
    });

    it('should use fuzzy matching for similar location names', () => {
      const prefs1 = {
        location: 'New York',
        education_level: 'Masters',
        interests: ['reading'],
      };

      const prefs2 = {
        location: 'New York City',
        education_level: 'Masters',
        interests: ['reading'],
      };

      const score = calculateCulturalCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(70); // Should recognize similarity
    });

    it('should calculate shared interests correctly', () => {
      const prefs1 = {
        location: 'London',
        education_level: 'doctorate',
        interests: ['reading', 'travel', 'cooking', 'sports'],
      };

      const prefs2 = {
        location: 'London',
        education_level: 'doctorate',
        interests: ['reading', 'travel', 'cooking', 'music'],
      };

      const score = calculateCulturalCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(70); // High overlap in interests
    });

    it('should handle empty interests arrays', () => {
      const prefs1 = {
        location: 'Tokyo',
        education_level: 'Masters',
        interests: [],
      };

      const prefs2 = {
        location: 'Tokyo',
        education_level: 'Masters',
        interests: [],
      };

      const score = calculateCulturalCompatibility(prefs1, prefs2);
      expect(score).toBeGreaterThan(0); // Should still compute based on location/education
    });

    it('should penalize very different locations', () => {
      const prefs1 = {
        location: 'Paris, France',
        education_level: 'Masters',
        interests: ['reading'],
      };

      const prefs2 = {
        location: 'Tokyo, Japan',
        education_level: 'Masters',
        interests: ['reading'],
      };

      const score = calculateCulturalCompatibility(prefs1, prefs2);

      const prefs3 = {
        location: 'Paris, France',
        education_level: 'Masters',
        interests: ['reading'],
      };

      const score2 = calculateCulturalCompatibility(prefs1, prefs3);
      expect(score).toBeLessThan(score2); // Different location should lower score
    });
  });

  describe('calculateOverallCompatibility', () => {
    it('should combine scores with default weights', () => {
      const islamicScore = 80;
      const culturalScore = 70;
      const personalityScore = 90;

      const overall = calculateOverallCompatibility(islamicScore, culturalScore, personalityScore);

      expect(overall).toBeGreaterThan(0);
      expect(overall).toBeLessThanOrEqual(100);
      expect(overall).toBeCloseTo(80, -1); // Should be near weighted average
    });

    it('should respect custom weights', () => {
      const islamicScore = 90;
      const culturalScore = 50;
      const personalityScore = 50;

      // Heavy weight on Islamic compatibility
      const overall = calculateOverallCompatibility(islamicScore, culturalScore, personalityScore, {
        islamic: 0.7,
        cultural: 0.15,
        personality: 0.15,
      });

      expect(overall).toBeGreaterThan(75); // Should be closer to Islamic score
    });

    it('should normalize weights that do not sum to 1', () => {
      const islamicScore = 80;
      const culturalScore = 70;
      const personalityScore = 60;

      const overall = calculateOverallCompatibility(
        islamicScore,
        culturalScore,
        personalityScore,
        { islamic: 2, cultural: 1, personality: 1 } // Weights sum to 4
      );

      expect(overall).toBeGreaterThan(0);
      expect(overall).toBeLessThanOrEqual(100);
    });
  });

  describe('generateCompatibilityExplanation', () => {
    it('should generate explanation with strengths and concerns', () => {
      const islamicScore = 90;
      const culturalScore = 80;
      const personalityScore = 70;

      const explanation = generateCompatibilityExplanation(
        islamicScore,
        culturalScore,
        personalityScore
      );

      expect(explanation).toHaveProperty('strengths');
      expect(explanation).toHaveProperty('concerns');
      expect(explanation).toHaveProperty('summary');
      expect(explanation.strengths).toBeInstanceOf(Array);
      expect(explanation.concerns).toBeInstanceOf(Array);
      expect(explanation.strengths.length).toBeGreaterThan(0);
    });

    it('should identify low scores as concerns', () => {
      const islamicScore = 30;
      const culturalScore = 40;
      const personalityScore = 90;

      const explanation = generateCompatibilityExplanation(
        islamicScore,
        culturalScore,
        personalityScore
      );

      expect(explanation.concerns.length).toBeGreaterThan(0);
      expect(explanation.concerns.some((c) => c.includes('religieuse'))).toBe(true);
    });

    it('should identify high scores as strengths', () => {
      const islamicScore = 95;
      const culturalScore = 85;
      const personalityScore = 90;

      const explanation = generateCompatibilityExplanation(
        islamicScore,
        culturalScore,
        personalityScore
      );

      expect(explanation.strengths.length).toBeGreaterThan(0);
      expect(explanation.strengths.some((s) => s.includes('religieuse'))).toBe(true);
    });

    it('should handle moderate scores', () => {
      const islamicScore = 65;
      const culturalScore = 65;
      const personalityScore = 65;

      const explanation = generateCompatibilityExplanation(
        islamicScore,
        culturalScore,
        personalityScore
      );

      // Should have at least some explanations
      expect(explanation.strengths.length + explanation.concerns.length).toBeGreaterThan(0);
    });
  });
});
