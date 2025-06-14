import { CompatibilityMatch } from "@/types/compatibility";
import { UserResultWithProfile } from "../types/matchingTypes";
import { ValidatedUserResults } from "./dataFetchingService";
import { UserAnswers, UserPreferences, AnswerValue } from "../types/validationTypes";
import { logError, logInfo } from "./loggingService";
import { calculateEnhancedCompatibilityScore, EnhancedCompatibilityMatch } from "../utils/enhancedCompatibilityScoring";

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
          dealbreakers: ['Calculation error']
        }
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
      let categoryScores: Record<string, { score: number; weight: number }> = {};
      let strengths: string[] = [];
      let differences: string[] = [];
      let dealbreakers: string[] = [];

      // Calculate category-based compatibility
      const categoryMap = this.getCategoryMap();
      
      for (const [categoryName, questions] of Object.entries(categoryMap)) {
        let categoryScore = 0;
        let categoryWeight = 0;
        
        for (const questionId of questions) {
          const myAnswer = myResults.answers[questionId];
          const theirAnswer = otherUser.answers[questionId];
          
          if (myAnswer && theirAnswer) {
            const questionScore = this.calculateQuestionScore(myAnswer, theirAnswer);
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
          const normalizedCategoryScore = (categoryScore / categoryWeight);
          categoryScores[categoryName] = { score: normalizedCategoryScore, weight: categoryWeight };
          totalScore += normalizedCategoryScore * categoryWeight;
          totalWeight += categoryWeight;
        }
      }

      // Apply user preferences
      const finalScore = this.applyUserPreferences(
        totalWeight > 0 ? (totalScore / totalWeight) : 0,
        myResults.preferences,
        categoryScores
      );

      return {
        userId: otherUser.user_id,
        score: Math.round(finalScore),
        matchDetails: {
          strengths: [...new Set(strengths)],
          differences: [...new Set(differences)],
          dealbreakers: dealbreakers.length > 0 ? dealbreakers : undefined,
          categoryScores
        },
        profileData: {
          first_name: otherUser.profiles.first_name,
          last_name: otherUser.profiles.last_name,
          location: otherUser.profiles.location,
          religious_practice_level: otherUser.profiles.religious_practice_level,
          education_level: otherUser.profiles.education_level,
          email_verified: otherUser.profiles.email_verified,
          phone_verified: otherUser.profiles.phone_verified,
          id_verified: otherUser.profiles.id_verified,
          age: otherUser.profiles.birth_date ? this.calculateAge(otherUser.profiles.birth_date) : undefined
        }
      };
    } catch (error) {
      logError('calculateBasicCompatibilityScore', error as Error);
      return {
        userId: otherUser.user_id,
        score: 0,
        matchDetails: {
          strengths: [],
          differences: ['Error calculating compatibility'],
          dealbreakers: ['Calculation error']
        }
      };
    }
  }

  private calculateQuestionScore(myAnswer: AnswerValue, theirAnswer: AnswerValue): number {
    // Calculate similarity based on answer values
    const difference = Math.abs(myAnswer.value - theirAnswer.value);
    const maxDifference = 100; // Assuming values are 0-100
    const similarity = 1 - (difference / maxDifference);
    return similarity * 100;
  }

  private applyUserPreferences(
    baseScore: number,
    preferences: UserPreferences,
    categoryScores: Record<string, { score: number; weight: number }>
  ): number {
    let weightedScore = baseScore;
    
    // Apply category weights from preferences
    if (preferences.categories && preferences.categories.length > 0) {
      let totalPreferenceWeight = 0;
      let adjustedScore = 0;
      
      for (const categoryPref of preferences.categories) {
        const categoryScore = categoryScores[categoryPref.category];
        if (categoryScore) {
          adjustedScore += categoryScore.score * categoryPref.weight;
          totalPreferenceWeight += categoryPref.weight;
        }
      }
      
      if (totalPreferenceWeight > 0) {
        weightedScore = adjustedScore / totalPreferenceWeight;
      }
    }
    
    return Math.max(0, Math.min(100, weightedScore));
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private getCategoryMap(): Record<string, string[]> {
    // This would ideally come from a configuration or database
    return {
      'Religious Practice': ['1', '2', '3'],
      'Family Values': ['4', '5', '6'],
      'Lifestyle': ['7', '8', '9'],
      'Education & Career': ['10', '11', '12'],
      'Personal Values': ['13', '14', '15']
    };
  }
}

export const compatibilityCalculator = new CompatibilityCalculator();
