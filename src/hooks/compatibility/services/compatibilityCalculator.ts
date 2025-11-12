import { CompatibilityMatch } from '@/types/compatibility';
import { UserResultWithProfile } from '../types/matchingTypes';
import { ValidatedUserResults } from './dataFetchingService';
import { UserAnswers, UserPreferences, AnswerValue } from '../types/validationTypes';
import { logError, logInfo } from './loggingService';
import {
  calculateEnhancedCompatibilityScore,
  EnhancedCompatibilityMatch,
} from '../utils/enhancedCompatibilityScoring';
import { polygamyCompatibilityService } from './polygamyCompatibilityService';
import { profileDataBuilder } from './profileDataBuilder';
import { scoringUtils } from './scoringUtils';

export class CompatibilityCalculator {
  calculateCompatibilityScore(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile
  ): EnhancedCompatibilityMatch {
    try {
      // Use the enhanced scoring algorithm that includes quality metrics
      return calculateEnhancedCompatibilityScore(myResults, otherUser);
    } catch (error) {
      logError('calculateCompatibilityScore', error as Error);
      return {
        userId: otherUser.user_id,
        score: 0,
        matchDetails: {
          strengths: [],
          differences: ['Error calculating compatibility'],
          dealbreakers: ['Calculation error'],
        },
      };
    }
  }

  // Keep the legacy method for backward compatibility
  calculateBasicCompatibilityScore(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile
  ): CompatibilityMatch {
    try {
      let totalScore = 0;
      let totalWeight = 0;
      const categoryScores: Record<string, { score: number; weight: number }> = {};
      const strengths: string[] = [];
      const differences: string[] = [];
      const dealbreakers: string[] = [];

      // Check polygamy compatibility first as it's critical
      const polygamyCompatibility = polygamyCompatibilityService.checkCompatibility(
        myResults,
        otherUser
      );
      if (polygamyCompatibility.isDealbreaker) {
        dealbreakers.push(polygamyCompatibility.reason);
        return {
          userId: otherUser.user_id,
          score: 0,
          matchDetails: {
            strengths: [],
            differences: [polygamyCompatibility.reason],
            dealbreakers,
          },
          profileData: profileDataBuilder.buildProfileData(otherUser),
        };
      } else if (polygamyCompatibility.isStrength) {
        strengths.push('Compatible sur la polygamie');
      }

      // Calculate category-based compatibility
      const categoryMap = scoringUtils.getCategoryMap();

      for (const [categoryName, questions] of Object.entries(categoryMap)) {
        let categoryScore = 0;
        let categoryWeight = 0;

        for (const questionId of questions) {
          const myAnswer = myResults.answers[questionId];
          const theirAnswer = otherUser.answers[questionId];

          if (myAnswer && theirAnswer) {
            const questionScore = scoringUtils.calculateQuestionScore(myAnswer, theirAnswer);
            const weight = myAnswer.weight || 1;

            categoryScore += questionScore * weight;
            categoryWeight += weight;

            // Check for dealbreakers
            if (myAnswer.isBreaker && questionScore < (myAnswer.breakerThreshold || 70)) {
              dealbreakers.push(`Incompatible ${categoryName} values`);
            }

            // Identify strengths and differences
            if (questionScore >= 80) {
              strengths.push(`Strong alignment in ${categoryName}`);
            } else if (questionScore < 40) {
              differences.push(`Different perspectives on ${categoryName}`);
            }
          }
        }

        if (categoryWeight > 0) {
          const normalizedCategoryScore = categoryScore / categoryWeight;
          categoryScores[categoryName] = { score: normalizedCategoryScore, weight: categoryWeight };
          totalScore += normalizedCategoryScore * categoryWeight;
          totalWeight += categoryWeight;
        }
      }

      // Apply user preferences
      let finalScore = scoringUtils.applyUserPreferences(
        totalWeight > 0 ? totalScore / totalWeight : 0,
        myResults.preferences,
        categoryScores
      );

      // Apply polygamy compatibility bonus/penalty
      if (polygamyCompatibility.scoreModifier !== 0) {
        finalScore += polygamyCompatibility.scoreModifier;
        finalScore = Math.max(0, Math.min(100, finalScore));
      }

      return {
        userId: otherUser.user_id,
        score: Math.round(finalScore),
        matchDetails: {
          strengths: [...new Set(strengths)],
          differences: [...new Set(differences)],
          dealbreakers: dealbreakers.length > 0 ? dealbreakers : undefined,
          categoryScores,
        },
        profileData: profileDataBuilder.buildProfileData(otherUser),
      };
    } catch (error) {
      logError('calculateBasicCompatibilityScore', error as Error);
      return {
        userId: otherUser.user_id,
        score: 0,
        matchDetails: {
          strengths: [],
          differences: ['Error calculating compatibility'],
          dealbreakers: ['Calculation error'],
        },
      };
    }
  }
}

export const compatibilityCalculator = new CompatibilityCalculator();
