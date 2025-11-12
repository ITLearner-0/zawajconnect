import { AnswerValue, UserPreferences } from '../types/validationTypes';

export class ScoringUtils {
  calculateQuestionScore(myAnswer: AnswerValue, theirAnswer: AnswerValue): number {
    // Calculate similarity based on answer values
    const difference = Math.abs(myAnswer.value - theirAnswer.value);
    const maxDifference = 100; // Assuming values are 0-100
    const similarity = 1 - difference / maxDifference;
    return similarity * 100;
  }

  applyUserPreferences(
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

  getCategoryMap(): Record<string, string[]> {
    // This would ideally come from a configuration or database
    return {
      'Religious Practice': ['1', '2', '3'],
      'Family Values': ['4', '5', '6'],
      Lifestyle: ['7', '8', '9'],
      'Education & Career': ['10', '11', '12'],
      'Personal Values': ['13', '14', '15'],
    };
  }
}

export const scoringUtils = new ScoringUtils();
