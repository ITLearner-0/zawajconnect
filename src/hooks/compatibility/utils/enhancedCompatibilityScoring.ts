
import { questions } from "@/data/compatibilityQuestions";
import { CompatibilityMatch } from "@/types/compatibility";
import { UserResultWithProfile } from "../types/matchingTypes";
import { getIslamicWeight, calculateCategoryCompatibility, calculateIslamicBonus } from "./islamicScoring";

export function calculateEnhancedCompatibilityScore(
  myResults: any,
  otherUser: UserResultWithProfile
): CompatibilityMatch {
  const myAnswers = myResults.answers as Record<string, any>;
  const otherAnswers = otherUser.answers as Record<string, any>;
  const profile = otherUser.profiles;

  let totalCompatibility = 0;
  let totalWeight = 0;
  let categoryScores: Record<string, { score: number; weight: number }> = {};
  let strengths: string[] = [];
  let differences: string[] = [];
  let dealbreakers: string[] = [];
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
    let compatibility = calculateCategoryCompatibility(questionObj, rawDifference);
    
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

  return {
    userId: otherUser.user_id,
    score: Math.round(finalScore),
    profileData: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      age,
      location: profile.location,
      religious_practice_level: profile.religious_practice_level,
      education_level: profile.education_level,
      email_verified: profile.email_verified,
      phone_verified: profile.phone_verified,
      id_verified: profile.id_verified
    },
    matchDetails: {
      strengths: [...new Set(strengths)],
      differences: [...new Set(differences)],
      dealbreakers: dealbreakers.length ? [...new Set(dealbreakers)] : undefined,
      categoryScores
    }
  };
}
