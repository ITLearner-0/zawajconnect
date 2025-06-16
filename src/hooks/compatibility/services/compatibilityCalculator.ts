
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

      // Check polygamy compatibility first as it's critical
      const polygamyCompatibility = this.checkPolygamyCompatibility(myResults, otherUser);
      if (polygamyCompatibility.isDealbreaker) {
        dealbreakers.push(polygamyCompatibility.reason);
        return {
          userId: otherUser.user_id,
          score: 0,
          matchDetails: {
            strengths: [],
            differences: [polygamyCompatibility.reason],
            dealbreakers
          },
          profileData: this.buildProfileData(otherUser)
        };
      } else if (polygamyCompatibility.isStrength) {
        strengths.push("Compatible sur la polygamie");
      }

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
      let finalScore = this.applyUserPreferences(
        totalWeight > 0 ? (totalScore / totalWeight) : 0,
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
          categoryScores
        },
        profileData: this.buildProfileData(otherUser)
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

  private checkPolygamyCompatibility(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile
  ): { isDealbreaker: boolean; isStrength: boolean; scoreModifier: number; reason: string } {
    // Access gender from user results answers or set default
    const myGender = myResults.answers?.gender?.value || 'unknown';
    const otherGender = otherUser.profiles?.gender || 'unknown';
    
    // Try to get polygamy stance from answers, fallback to profiles
    const myPolygamyStance = myResults.answers?.polygamy_stance?.value || 'not_specified';
    const otherPolygamyStance = otherUser.answers?.polygamy_stance?.value || 'not_specified';

    // If either doesn't have a stance, neutral compatibility
    if (myPolygamyStance === 'not_specified' || otherPolygamyStance === 'not_specified') {
      return { isDealbreaker: false, isStrength: false, scoreModifier: 0, reason: "" };
    }

    // Male-Female compatibility check
    if (myGender === 'male' && otherGender === 'female') {
      // Man wants polygamy, woman refuses
      if ((myPolygamyStance === 'oui') && (otherPolygamyStance === 'refuse')) {
        return { 
          isDealbreaker: true, 
          isStrength: false, 
          scoreModifier: 0, 
          reason: "Incompatibilité sur la polygamie : homme souhaite, femme refuse" 
        };
      }
      
      // Man doesn't want polygamy, woman only accepts polygamy
      if ((myPolygamyStance === 'non') && (otherPolygamyStance === 'accepte')) {
        return { 
          isDealbreaker: false, 
          isStrength: false, 
          scoreModifier: -10, 
          reason: "Différence sur la polygamie : homme préfère monogamie, femme accepte polygamie" 
        };
      }
      
      // Perfect match: both want monogamy
      if ((myPolygamyStance === 'non') && (otherPolygamyStance === 'refuse')) {
        return { 
          isDealbreaker: false, 
          isStrength: true, 
          scoreModifier: 15, 
          reason: "Excellente compatibilité : tous deux préfèrent la monogamie" 
        };
      }
      
      // Good match: man wants polygamy, woman accepts
      if ((myPolygamyStance === 'oui' || myPolygamyStance === 'peut_etre') && 
          (otherPolygamyStance === 'accepte' || otherPolygamyStance === 'conditionnelle')) {
        return { 
          isDealbreaker: false, 
          isStrength: true, 
          scoreModifier: 10, 
          reason: "Bonne compatibilité sur la polygamie" 
        };
      }
    }
    
    // Female-Male compatibility check (reverse perspective)
    if (myGender === 'female' && otherGender === 'male') {
      // Woman refuses polygamy, man wants it
      if ((myPolygamyStance === 'refuse') && (otherPolygamyStance === 'oui')) {
        return { 
          isDealbreaker: true, 
          isStrength: false, 
          scoreModifier: 0, 
          reason: "Incompatibilité sur la polygamie : femme refuse, homme souhaite" 
        };
      }
      
      // Perfect match: both prefer monogamy
      if ((myPolygamyStance === 'refuse') && (otherPolygamyStance === 'non')) {
        return { 
          isDealbreaker: false, 
          isStrength: true, 
          scoreModifier: 15, 
          reason: "Excellente compatibilité : tous deux préfèrent la monogamie" 
        };
      }
      
      // Good match: woman accepts, man wants polygamy
      if ((myPolygamyStance === 'accepte' || myPolygamyStance === 'conditionnelle') && 
          (otherPolygamyStance === 'oui' || otherPolygamyStance === 'peut_etre')) {
        return { 
          isDealbreaker: false, 
          isStrength: true, 
          scoreModifier: 10, 
          reason: "Bonne compatibilité sur la polygamie" 
        };
      }
    }

    // Default neutral compatibility
    return { isDealbreaker: false, isStrength: false, scoreModifier: 0, reason: "" };
  }

  private buildProfileData(otherUser: UserResultWithProfile) {
    return {
      first_name: otherUser.profiles.first_name,
      last_name: otherUser.profiles.last_name,
      location: otherUser.profiles.location,
      religious_practice_level: otherUser.profiles.religious_practice_level,
      education_level: otherUser.profiles.education_level,
      email_verified: otherUser.profiles.email_verified,
      phone_verified: otherUser.profiles.phone_verified,
      id_verified: otherUser.profiles.id_verified,
      age: otherUser.profiles.birth_date ? this.calculateAge(otherUser.profiles.birth_date) : undefined
    };
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
