import { questions } from '@/data/compatibilityQuestions';

export function getIslamicWeight(question: any, userWeight?: number): number {
  const baseWeight = userWeight || question.weight;

  // Increase weight for critical Islamic values
  const criticalCategories = [
    'Pratique Religieuse',
    'Objectifs Spirituels',
    'Fidélité',
    'Engagement Long Terme',
    'Valeurs Familiales',
  ];

  if (criticalCategories.includes(question.category)) {
    return baseWeight * 1.5; // 50% increase for Islamic priorities
  }

  return baseWeight;
}

export function calculateCategoryCompatibility(question: any, rawDifference: number): number {
  if (question.isBreaker) {
    // Stricter scoring for dealbreaker questions
    return rawDifference <= 15 ? 100 : Math.max(0, 100 - rawDifference * 2.5);
  } else {
    // Standard scoring with bonuses for high agreement
    let compatibility = 100 - rawDifference;
    if (rawDifference <= 10)
      compatibility += 15; // Bonus for very close answers
    else if (rawDifference <= 20) compatibility += 5; // Small bonus for close answers
    return Math.max(0, compatibility);
  }
}

export function calculateIslamicBonus(
  categoryScores: Record<string, { score: number; weight: number }>
): number {
  const islamicCategories = [
    'Pratique Religieuse',
    'Objectifs Spirituels',
    'Fidélité',
    'Engagement Long Terme',
  ];

  let bonus = 0;
  islamicCategories.forEach((category) => {
    if (categoryScores[category]) {
      const categoryPercentage =
        (categoryScores[category].score / (categoryScores[category].weight * 100)) * 100;
      if (categoryPercentage >= 95) bonus += 8;
      else if (categoryPercentage >= 90) bonus += 5;
      else if (categoryPercentage >= 85) bonus += 3;
    }
  });

  return Math.min(15, bonus); // Cap bonus at 15 points
}
