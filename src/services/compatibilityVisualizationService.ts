
import { CompatibilityMatch } from '@/types/compatibility';
import { CompatibilityVisualization, CompatibilityPoint } from '@/types/filters';
import { questions } from '@/data/compatibilityQuestions';

export class CompatibilityVisualizationService {
  static generateVisualization(match: CompatibilityMatch): CompatibilityVisualization {
    const { matchDetails } = match;
    
    // Générer les points de force
    const strengths: CompatibilityPoint[] = matchDetails.strengths?.map(category => ({
      category,
      score: 85 + Math.random() * 15, // Score élevé pour les forces
      weight: this.getCategoryWeight(category),
      description: this.getCategoryDescription(category, true),
      isStrength: true,
      isDifference: false
    })) || [];

    // Générer les différences
    const differences: CompatibilityPoint[] = matchDetails.differences?.map(category => ({
      category,
      score: 20 + Math.random() * 40, // Score plus faible pour les différences
      weight: this.getCategoryWeight(category),
      description: this.getCategoryDescription(category, false),
      isStrength: false,
      isDifference: true
    })) || [];

    // Calculer le score de répartition par catégorie
    const compatibilityBreakdown = {
      religious: this.calculateCategoryScore(strengths, differences, 'Religious Practice'),
      lifestyle: this.calculateCategoryScore(strengths, differences, 'Lifestyle'),
      personal: this.calculateCategoryScore(strengths, differences, 'Personal Values'),
      family: this.calculateCategoryScore(strengths, differences, 'Family Values')
    };

    return {
      overallScore: match.score,
      strengths,
      differences,
      dealbreakers: matchDetails.dealbreakers || [],
      compatibilityBreakdown
    };
  }

  private static getCategoryWeight(category: string): number {
    const question = questions.find(q => q.category === category);
    return question?.weight || 1;
  }

  private static getCategoryDescription(category: string, isStrength: boolean): string {
    const descriptions = {
      'Religious Practice': isStrength 
        ? 'Vous partagez des pratiques religieuses similaires'
        : 'Vos pratiques religieuses diffèrent',
      'Family Values': isStrength 
        ? 'Vous avez des valeurs familiales compatibles'
        : 'Vos priorités familiales peuvent différer',
      'Lifestyle': isStrength 
        ? 'Vos modes de vie sont complémentaires'
        : 'Vos styles de vie pourraient nécessiter des ajustements',
      'Personal Values': isStrength 
        ? 'Vos valeurs personnelles s\'alignent bien'
        : 'Vous pourriez avoir des perspectives différentes'
    };

    return descriptions[category as keyof typeof descriptions] || 
           (isStrength ? 'Point de compatibilité' : 'Différence à explorer');
  }

  private static calculateCategoryScore(
    strengths: CompatibilityPoint[], 
    differences: CompatibilityPoint[], 
    category: string
  ): number {
    const categoryStrengths = strengths.filter(s => s.category.includes(category));
    const categoryDifferences = differences.filter(d => d.category.includes(category));
    
    if (categoryStrengths.length === 0 && categoryDifferences.length === 0) {
      return 75; // Score neutre
    }

    const strengthScore = categoryStrengths.reduce((acc, s) => acc + s.score, 0) / (categoryStrengths.length || 1);
    const differenceScore = categoryDifferences.reduce((acc, d) => acc + d.score, 0) / (categoryDifferences.length || 1);
    
    if (categoryStrengths.length > 0 && categoryDifferences.length === 0) {
      return strengthScore;
    }
    
    if (categoryDifferences.length > 0 && categoryStrengths.length === 0) {
      return differenceScore;
    }
    
    return (strengthScore + differenceScore) / 2;
  }
}
