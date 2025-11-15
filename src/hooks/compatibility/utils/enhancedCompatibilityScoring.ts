
import { questions } from "@/data/compatibilityQuestions";
import { CompatibilityMatch } from "@/types/compatibility";
import { UserResultWithProfile } from "../types/matchingTypes";
import { getIslamicWeight, calculateCategoryCompatibility, calculateIslamicBonus } from "./islamicScoring";
import { matchQualityService, MatchQualityMetrics } from "../services/matchQualityService";
import { ValidatedUserResults } from "../services/dataFetchingService";

export interface EnhancedCompatibilityMatch extends CompatibilityMatch {
  qualityMetrics?: MatchQualityMetrics;
}

export function calculateEnhancedCompatibilityScore(
  myResults: ValidatedUserResults,
  otherUser: UserResultWithProfile
): EnhancedCompatibilityMatch {
  const myAnswers = myResults.answers as Record<string, any>;
  const otherAnswers = otherUser.answers as Record<string, any>;
  const profile = otherUser.profiles;

  let totalCompatibility = 0;
  let totalWeight = 0;
  const categoryScores: Record<string, { score: number; weight: number }> = {};
  const strengths: string[] = [];
  const differences: string[] = [];
  const dealbreakers: string[] = [];
  let hasDealbreaker = false;

  // Enhanced scoring algorithm with Islamic values emphasis
  Object.entries(myAnswers).forEach(([qId, myAnswer]) => {
    const otherAnswer = otherAnswers[qId];
    const questionObj = questions.find(q => q.id.toString() === qId);
    
    if (!questionObj || !myAnswer || !otherAnswer) return;
    
    const category = questionObj.category;
    const effectiveWeight = getIslamicWeight(questionObj, myAnswer.weight);
    
    // Calculate compatibility with Islamic emphasis
    const rawDifference = Math.abs(myAnswer.value - otherAnswer.value);
    const compatibility = calculateCategoryCompatibility(questionObj, rawDifference);
    
    // Category tracking
    if (!categoryScores[category]) {
      categoryScores[category] = { score: 0, weight: 0 };
    }
    categoryScores[category].score += compatibility * effectiveWeight;
    categoryScores[category].weight += effectiveWeight;
    
    totalCompatibility += (compatibility * effectiveWeight);
    totalWeight += effectiveWeight;

    // Track strengths and differences
    if (compatibility >= 85) strengths.push(category);
    else if (compatibility <= 50) differences.push(category);

    // Enhanced dealbreaker detection
    if (myAnswer.isBreaker && 
        myAnswer.breakerThreshold && 
        otherAnswer.value < myAnswer.breakerThreshold) {
      dealbreakers.push(category);
      hasDealbreaker = true;
    }
  });

  // Calculate final score with Islamic bonuses
  let finalScore = totalWeight > 0 ? (totalCompatibility / (totalWeight * 100)) * 100 : 0;
  
  // Apply Islamic priority bonuses
  const islamicBonus = calculateIslamicBonus(categoryScores);
  finalScore = Math.min(100, finalScore + islamicBonus);
  
  // Apply dealbreaker penalty
  if (hasDealbreaker) {
    finalScore = Math.max(0, finalScore - 25);
  }

  // Calculate age for display
  let age;
  if (profile.birth_date) {
    age = new Date().getFullYear() - new Date(profile.birth_date).getFullYear();
  }

  const compatibilityMatch: CompatibilityMatch = {
    userId: otherUser.user_id,
    fullName: `${profile.first_name} ${profile.last_name || ''}`.trim(),
    score: Math.round(finalScore),
    compatibilityScore: Math.round(finalScore),
    profileData: {
      id: otherUser.user_id,
      first_name: profile.first_name,
      last_name: profile.last_name ?? undefined,
      gender: profile.gender,
      age,
      location: profile.location ?? undefined,
      religious_practice_level: profile.religious_practice_level ?? undefined,
      education_level: profile.education_level ?? undefined,
      email_verified: profile.email_verified,
      phone_verified: profile.phone_verified,
      id_verified: profile.id_verified
    },
    matchDetails: {
      strengths: [...new Set(strengths)],
      challenges: [...new Set(differences)],
      compatibility: Math.round(finalScore)
    } as any
  } as any;

  // Calculate quality metrics
  const qualityMetrics = matchQualityService.calculateMatchQuality(
    myResults,
    otherUser,
    compatibilityMatch
  );

  return {
    ...compatibilityMatch,
    qualityMetrics
  };
}
