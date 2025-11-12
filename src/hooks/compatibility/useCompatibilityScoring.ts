import { questions } from '@/data/compatibilityQuestions';

export interface CategoryScores {
  [category: string]: { score: number; weight: number };
}

export interface MatchScoreResult {
  score: number;
  categoryScores: CategoryScores;
  strengths: string[];
  differences: string[];
  dealbreakers: string[];
  hasDealbreaker: boolean;
}

export function calculateCompatibilityScore(
  myAnswers: Record<string, any>,
  otherAnswers: Record<string, any>
): MatchScoreResult {
  let totalCompatibility = 0;
  let totalWeight = 0;
  const categoryScores: CategoryScores = {};
  const dealbreakers: string[] = [];
  let hasDealbreaker = false;

  // Process each answer with enhanced algorithm
  Object.entries(myAnswers).forEach(([qId, myAnswer]) => {
    const otherAnswer = otherAnswers[qId];
    const questionObj = questions.find((q) => q.id.toString() === qId);

    if (!questionObj || !myAnswer || !otherAnswer) return;

    const category = questionObj.category;
    const effectiveWeight = myAnswer.weight || questionObj.weight;

    // Enhanced compatibility calculation
    const rawDifference = Math.abs(myAnswer.value - otherAnswer.value);

    // Apply Islamic values weighting - critical questions get exponential scoring
    let compatibility;
    if (questionObj.isBreaker) {
      // For dealbreaker questions, use stricter scoring
      compatibility = rawDifference <= 20 ? 100 : Math.max(0, 100 - rawDifference * 2);
    } else {
      // For regular questions, use linear scoring with bonuses for high agreement
      compatibility = 100 - rawDifference;
      if (rawDifference <= 10) compatibility += 10; // Bonus for very close answers
    }

    // Category-based scoring
    if (!categoryScores[category]) {
      categoryScores[category] = { score: 0, weight: 0 };
    }
    categoryScores[category].score += compatibility * effectiveWeight;
    categoryScores[category].weight += effectiveWeight;

    totalCompatibility += compatibility * effectiveWeight;
    totalWeight += effectiveWeight;

    // Enhanced dealbreaker detection
    if (
      myAnswer.isBreaker &&
      myAnswer.breakerThreshold &&
      otherAnswer.value < myAnswer.breakerThreshold
    ) {
      dealbreakers.push(category);
      hasDealbreaker = true;
    }
  });

  // Calculate weighted score with category bonuses
  let finalScore = totalWeight > 0 ? (totalCompatibility / (totalWeight * 100)) * 100 : 0;

  // Apply category-based bonuses for Islamic priorities
  const criticalCategories = [
    'Pratique Religieuse',
    'Objectifs Spirituels',
    'Fidélité',
    'Engagement Long Terme',
  ];
  let categoryBonus = 0;

  criticalCategories.forEach((category) => {
    if (categoryScores[category]) {
      const categoryPercentage =
        (categoryScores[category].score / (categoryScores[category].weight * 100)) * 100;
      if (categoryPercentage >= 90) categoryBonus += 5;
      else if (categoryPercentage >= 80) categoryBonus += 2;
    }
  });

  finalScore = Math.min(100, finalScore + categoryBonus);

  // Apply dealbreaker penalty
  if (hasDealbreaker) {
    finalScore = Math.max(0, finalScore - 30); // Severe penalty but not complete elimination
  }

  // Calculate strengths and differences with enhanced logic
  const strengths: string[] = [];
  const differences: string[] = [];

  Object.entries(categoryScores).forEach(([category, data]) => {
    const categoryPercentage = (data.score / (data.weight * 100)) * 100;
    if (categoryPercentage >= 85) strengths.push(category);
    else if (categoryPercentage <= 50) differences.push(category);
  });

  return {
    score: Math.round(finalScore),
    categoryScores,
    strengths: [...new Set(strengths)],
    differences: [...new Set(differences)],
    dealbreakers: dealbreakers.length ? [...new Set(dealbreakers)] : [],
    hasDealbreaker,
  };
}
