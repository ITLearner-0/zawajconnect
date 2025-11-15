import { CompatibilityMatch } from '@/types/compatibility';
import { UserResultWithProfile } from '../types/matchingTypes';
import { ValidatedUserResults } from './dataFetchingService';
import { logInfo } from './loggingService';

export interface MatchQualityMetrics {
  confidenceScore: number;
  compatibilityReasons: string[];
  improvementSuggestions: string[];
  dataQuality: {
    profileCompleteness: number;
    answersQuality: number;
    verificationLevel: number;
  };
}

export class MatchQualityService {
  calculateMatchQuality(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile,
    compatibilityMatch: CompatibilityMatch
  ): MatchQualityMetrics {
    const confidenceScore = this.calculateConfidenceScore(myResults, otherUser, compatibilityMatch);
    const compatibilityReasons = this.generateCompatibilityReasons(compatibilityMatch);
    const improvementSuggestions = this.generateImprovementSuggestions(
      myResults,
      otherUser,
      compatibilityMatch
    );
    const dataQuality = this.calculateDataQuality(otherUser);

    return {
      confidenceScore,
      compatibilityReasons,
      improvementSuggestions,
      dataQuality,
    };
  }

  private calculateConfidenceScore(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile,
    match: CompatibilityMatch
  ): number {
    let confidence = match.score ?? match.compatibilityScore ?? 0;

    // Boost confidence based on profile completeness
    const profileCompleteness = this.getProfileCompleteness(otherUser);
    confidence = (confidence ?? 0) * (0.7 + profileCompleteness * 0.3);

    // Boost confidence based on verification status
    const verificationBonus = this.getVerificationBonus(otherUser);
    confidence = (confidence ?? 0) * (0.8 + verificationBonus * 0.2);

    // Boost confidence based on answer quality
    const answerQuality = this.getAnswerQuality(myResults, otherUser);
    confidence = (confidence ?? 0) * (0.85 + answerQuality * 0.15);

    // Penalize if there are dealbreakers
    if (
      (match.matchDetails as any)?.dealbreakers &&
      (match.matchDetails as any).dealbreakers.length > 0
    ) {
      confidence = (confidence ?? 0) * 0.7;
    }

    return Math.min(100, Math.max(0, Math.round(confidence ?? 0)));
  }

  private generateCompatibilityReasons(match: CompatibilityMatch): string[] {
    const reasons: string[] = [];

    if (match.matchDetails?.strengths) {
      match.matchDetails.strengths.forEach((strength) => {
        reasons.push(`Strong alignment in ${strength}`);
      });
    }

    if ((match.matchDetails as any)?.categoryScores) {
      Object.entries((match.matchDetails as any).categoryScores).forEach(
        ([category, data]: [string, any]) => {
          const categoryPercentage = ((data as any).score / ((data as any).weight * 100)) * 100;
          if (categoryPercentage >= 90) {
            reasons.push(
              `Exceptional compatibility in ${category} (${Math.round(categoryPercentage)}%)`
            );
          } else if (categoryPercentage >= 80) {
            reasons.push(`High compatibility in ${category} (${Math.round(categoryPercentage)}%)`);
          }
        }
      );
    }

    // Add specific compatibility reasons based on profile data
    if (match.profileData) {
      if (match.profileData.religious_practice_level) {
        reasons.push(
          `Shared religious practice level: ${match.profileData.religious_practice_level}`
        );
      }
      if (match.profileData.education_level) {
        reasons.push(`Compatible education background: ${match.profileData.education_level}`);
      }
    }

    return reasons.slice(0, 5); // Limit to top 5 reasons
  }

  private generateImprovementSuggestions(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile,
    match: CompatibilityMatch
  ): string[] {
    const suggestions: string[] = [];

    // Suggestions based on profile completeness
    const profileCompleteness = this.getProfileCompleteness(otherUser);
    if (profileCompleteness < 0.8) {
      suggestions.push('Encourage them to complete their profile for better matching accuracy');
    }

    // Suggestions based on verification status
    if (!otherUser.profiles.email_verified) {
      suggestions.push('Suggest email verification to increase trust');
    }
    if (!otherUser.profiles.phone_verified) {
      suggestions.push('Recommend phone verification for better security');
    }

    // Suggestions based on differences
    if ((match.matchDetails as any)?.differences || match.matchDetails?.challenges) {
      const differences =
        (match.matchDetails as any)?.differences || match.matchDetails?.challenges || [];
      differences.forEach((difference: any) => {
        suggestions.push(
          `Discuss your differences in ${difference} to understand each other better`
        );
      });
    }

    // Suggestions based on dealbreakers
    if (
      (match.matchDetails as any)?.dealbreakers &&
      (match.matchDetails as any).dealbreakers.length > 0
    ) {
      suggestions.push('Address potential dealbreakers through open and honest communication');
      suggestions.push('Consider seeking guidance from a marriage counselor or imam');
    }

    // General suggestions for lower compatibility scores
    if ((match.score ?? match.compatibilityScore ?? 0) < 70) {
      suggestions.push('Take time to get to know each other before making any commitments');
      suggestions.push('Focus on building a strong friendship foundation');
    }

    return suggestions.slice(0, 4); // Limit to top 4 suggestions
  }

  private calculateDataQuality(otherUser: UserResultWithProfile) {
    return {
      profileCompleteness: this.getProfileCompleteness(otherUser),
      answersQuality: this.getSingleUserAnswerQuality(otherUser),
      verificationLevel: this.getVerificationLevel(otherUser),
    };
  }

  private getProfileCompleteness(user: UserResultWithProfile): number {
    const profile = user.profiles;
    // Only check fields that actually exist in ValidatedProfileData
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.birth_date,
      profile.location,
      profile.education_level,
      profile.religious_practice_level,
      profile.gender,
    ];

    const completedFields = fields.filter(
      (field) => field && field.toString().trim().length > 0
    ).length;
    return completedFields / fields.length;
  }

  private getVerificationBonus(user: UserResultWithProfile): number {
    const profile = user.profiles;
    let bonus = 0;

    if (profile.email_verified) bonus += 0.3;
    if (profile.phone_verified) bonus += 0.3;
    if (profile.id_verified) bonus += 0.4;

    return Math.min(1, bonus);
  }

  private getVerificationLevel(user: UserResultWithProfile): number {
    return this.getVerificationBonus(user);
  }

  private getAnswerQuality(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile
  ): number {
    const myAnswers = Object.keys(myResults.answers).length;
    const theirAnswers = Object.keys(otherUser.answers).length;
    const maxAnswers = Math.max(myAnswers, theirAnswers);
    const minAnswers = Math.min(myAnswers, theirAnswers);

    return maxAnswers > 0 ? minAnswers / maxAnswers : 0;
  }

  private getSingleUserAnswerQuality(user: UserResultWithProfile): number {
    const answers = Object.values(user.answers);
    if (answers.length === 0) return 0;

    // Check for thoughtful answers (not just selecting middle values)
    const thoughtfulAnswers = answers.filter((answer) => {
      if (typeof answer === 'object' && answer.value !== undefined) {
        // Avoid middle values (around 50) which might indicate low engagement
        return answer.value < 30 || answer.value > 70;
      }
      return true;
    });

    return thoughtfulAnswers.length / answers.length;
  }
}

export const matchQualityService = new MatchQualityService();
