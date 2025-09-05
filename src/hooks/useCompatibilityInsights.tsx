import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibility } from '@/hooks/useCompatibility';
import { getGuidanceByCategory, getRandomGuidance } from '@/data/islamicGuidance';

interface CompatibilityArea {
  category: string;
  score: number;
  description: string;
}

interface Suggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface RedFlag {
  title: string;
  description: string;
  severity: 'warning' | 'important' | 'critical';
}

interface IslamicGuidance {
  title: string;
  verse: string;
  source: string;
  application: string;
}

interface CompatibilityInsights {
  summary: string;
  priorities: string[];
  relationshipStyle: string;
  compatibilityAreas: CompatibilityArea[];
  idealPartner: string[];
  suggestions: Suggestion[];
  redFlags: RedFlag[];
  islamicGuidance: IslamicGuidance[];
}

export const useCompatibilityInsights = (userId?: string) => {
  const { user } = useAuth();
  const { responses, stats, loading } = useCompatibility();
  const [insights, setInsights] = useState<CompatibilityInsights | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && responses.length > 0) {
      generateInsights();
    }
  }, [responses, loading]);

  const generateInsights = async () => {
    setAnalyzing(true);
    
    try {
      // Analyze responses to generate insights
      const analysisResult = analyzeResponses(responses);
      setInsights(analysisResult);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeResponses = (responses: any[]): CompatibilityInsights => {
    // Convert responses to a map for easier access
    const responseMap = responses.reduce((map, response) => {
      map[response.question_key] = response.response_value;
      return map;
    }, {} as Record<string, string>);

    // Generate personality summary
    const summary = generatePersonalitySummary(responseMap);
    
    // Identify priorities
    const priorities = identifyPriorities(responseMap);
    
    // Determine relationship style
    const relationshipStyle = determineRelationshipStyle(responseMap);
    
    // Calculate compatibility areas
    const compatibilityAreas = calculateCompatibilityAreas(responseMap);
    
    // Generate ideal partner profile
    const idealPartner = generateIdealPartnerProfile(responseMap);
    
    // Generate improvement suggestions
    const suggestions = generateSuggestions(responseMap);
    
    // Identify red flags
    const redFlags = identifyRedFlags(responseMap);
    
    // Get relevant Islamic guidance
    const islamicGuidance = getIslamicGuidance(responseMap);

    return {
      summary,
      priorities,
      relationshipStyle,
      compatibilityAreas,
      idealPartner,
      suggestions,
      redFlags,
      islamicGuidance
    };
  };

  const generatePersonalitySummary = (responses: Record<string, string>): string => {
    const traits = [];
    
    // Economic autonomy
    if (responses['economic_autonomy'] === 'complete_independence') {
      traits.push('vous valorisez l\'indépendance financière');
    } else if (responses['economic_autonomy'] === 'shared_responsibilities') {
      traits.push('vous préférez partager les responsabilités économiques');
    }
    
    // Family decision making
    if (responses['family_decisions'] === 'consensus_decisions') {
      traits.push('vous privilégiez les décisions consensuelles');
    } else if (responses['family_decisions'] === 'husband_leads') {
      traits.push('vous respectez le leadership masculin dans la famille');
    }
    
    // Career importance
    if (responses['career_importance'] === 'very_important') {
      traits.push('votre carrière est très importante pour vous');
    } else if (responses['career_importance'] === 'moderately_important') {
      traits.push('vous équilibrez carrière et vie familiale');
    }

    return `Basé sur vos réponses, ${traits.join(', ')}. Cela reflète une approche ${getPersonalityType(responses)} des relations.`;
  };

  const getPersonalityType = (responses: Record<string, string>): string => {
    let traditionalScore = 0;
    let modernScore = 0;
    
    // Score based on key indicators
    if (responses['economic_autonomy'] === 'husband_provides') traditionalScore++;
    if (responses['economic_autonomy'] === 'complete_independence') modernScore++;
    
    if (responses['family_decisions'] === 'husband_leads') traditionalScore++;
    if (responses['family_decisions'] === 'consensus_decisions') modernScore++;
    
    if (responses['domestic_responsibilities'] === 'wife_primarily') traditionalScore++;
    if (responses['domestic_responsibilities'] === 'equal_sharing') modernScore++;

    if (traditionalScore > modernScore) return 'traditionnelle';
    if (modernScore > traditionalScore) return 'moderne';
    return 'équilibrée';
  };

  const identifyPriorities = (responses: Record<string, string>): string[] => {
    const priorities = [];
    
    if (responses['economic_autonomy']?.includes('independence')) {
      priorities.push('Indépendance financière');
    }
    if (responses['career_importance'] === 'very_important') {
      priorities.push('Développement professionnel');
    }
    if (responses['family_decisions'] === 'consensus_decisions') {
      priorities.push('Communication & consensus');
    }
    if (responses['marriage_timeline'] === 'within_year') {
      priorities.push('Mariage rapide');
    }
    if (responses['children_timeline'] === 'immediately_after_marriage') {
      priorities.push('Fonder une famille rapidement');
    }

    return priorities.length > 0 ? priorities : ['Stabilité', 'Respect mutuel', 'Croissance spirituelle'];
  };

  const determineRelationshipStyle = (responses: Record<string, string>): string => {
    const styles = [];
    
    if (responses['family_decisions'] === 'consensus_decisions') {
      return 'Partnership collaboratif avec prise de décision partagée';
    } else if (responses['family_decisions'] === 'husband_leads') {
      return 'Structure familiale traditionnelle avec leadership masculin respectueux';
    } else if (responses['family_decisions'] === 'wife_leads') {
      return 'Approche moderne avec leadership féminin';
    }
    
    return 'Style relationnel équilibré et adaptatif';
  };

  const calculateCompatibilityAreas = (responses: Record<string, string>): CompatibilityArea[] => {
    const areas = [
      {
        category: 'Autonomie Économique',
        score: calculateEconomicCompatibility(responses),
        description: 'Votre approche des finances et de l\'indépendance économique'
      },
      {
        category: 'Responsabilités Domestiques',
        score: calculateDomesticCompatibility(responses),
        description: 'Vos attentes concernant les tâches ménagères et familiales'
      },
      {
        category: 'Prise de Décision',
        score: calculateDecisionMakingCompatibility(responses),
        description: 'Votre style de prise de décision en famille'
      },
      {
        category: 'Carrière & Famille',
        score: calculateCareerFamilyCompatibility(responses),
        description: 'L\'équilibre entre aspirations professionnelles et familiales'
      },
      {
        category: 'Mariage & Engagement',
        score: calculateMarriageCompatibility(responses),
        description: 'Vos attentes concernant l\'engagement et le mariage'
      }
    ];

    return areas;
  };

  const calculateEconomicCompatibility = (responses: Record<string, string>): number => {
    // Base score on consistency and realistic expectations
    let score = 70;
    
    if (responses['economic_autonomy'] === 'shared_responsibilities') score += 20;
    if (responses['economic_autonomy'] === 'complete_independence') score += 15;
    if (responses['financial_planning'] === 'joint_planning') score += 10;
    
    return Math.min(score, 100);
  };

  const calculateDomesticCompatibility = (responses: Record<string, string>): number => {
    let score = 70;
    
    if (responses['domestic_responsibilities'] === 'equal_sharing') score += 25;
    if (responses['domestic_responsibilities'] === 'based_on_availability') score += 20;
    
    return Math.min(score, 100);
  };

  const calculateDecisionMakingCompatibility = (responses: Record<string, string>): number => {
    let score = 70;
    
    if (responses['family_decisions'] === 'consensus_decisions') score += 25;
    if (responses['family_decisions'] === 'husband_leads') score += 15;
    
    return Math.min(score, 100);
  };

  const calculateCareerFamilyCompatibility = (responses: Record<string, string>): number => {
    let score = 70;
    
    if (responses['career_importance'] === 'moderately_important') score += 25;
    if (responses['career_vs_family'] === 'balance_both') score += 20;
    
    return Math.min(score, 100);
  };

  const calculateMarriageCompatibility = (responses: Record<string, string>): number => {
    let score = 80;
    
    if (responses['marriage_timeline'] && responses['children_timeline']) score += 20;
    
    return Math.min(score, 100);
  };

  const generateIdealPartnerProfile = (responses: Record<string, string>): string[] => {
    const traits = [];
    
    if (responses['economic_autonomy'] === 'shared_responsibilities') {
      traits.push('Partagent les responsabilités financières équitablement');
    }
    
    if (responses['family_decisions'] === 'consensus_decisions') {
      traits.push('Privilégient la communication et les décisions partagées');
    }
    
    if (responses['domestic_responsibilities'] === 'equal_sharing') {
      traits.push('Contribuent équitablement aux tâches domestiques');
    }
    
    if (responses['career_importance'] === 'very_important') {
      traits.push('Soutiennent et comprennent vos ambitions professionnelles');
    }
    
    if (responses['marriage_timeline'] === 'within_year') {
      traits.push('Sont prêts pour un engagement matrimonial sérieux');
    }

    // Add default traits if none specific
    if (traits.length === 0) {
      traits.push(
        'Partagent vos valeurs islamiques fondamentales',
        'Communiquent ouvertement et respectueusement',
        'Sont engagés dans leur croissance spirituelle',
        'Valorisent la famille et les relations durables'
      );
    }
    
    return traits;
  };

  const generateSuggestions = (responses: Record<string, string>): Suggestion[] => {
    const suggestions = [];
    
    // Economic flexibility
    if (responses['economic_autonomy'] === 'husband_provides') {
      suggestions.push({
        title: 'Considérez plus de flexibilité économique',
        description: 'Être ouvert à des arrangements financiers partagés peut élargir votre bassin de partenaires compatibles et créer des relations plus équilibrées.',
        priority: 'medium' as const
      });
    }
    
    // Career balance
    if (responses['career_importance'] === 'not_important') {
      suggestions.push({
        title: 'Valorisez le développement personnel',
        description: 'Même si la carrière n\'est pas prioritaire, encourager le développement personnel et professionnel peut enrichir votre relation.',
        priority: 'low' as const
      });
    }
    
    // Decision making
    if (responses['family_decisions'] === 'wife_leads' || responses['family_decisions'] === 'husband_leads') {
      suggestions.push({
        title: 'Explorez la prise de décision collaborative',
        description: 'Les décisions consensuelles renforcent l\'unité du couple et réduisent les conflits potentiels.',
        priority: 'high' as const
      });
    }

    // Timeline alignment
    if (!responses['marriage_timeline'] || !responses['children_timeline']) {
      suggestions.push({
        title: 'Clarifiez vos attentes temporelles',
        description: 'Avoir des attentes claires concernant le mariage et les enfants aide à trouver des partenaires alignés.',
        priority: 'high' as const
      });
    }
    
    return suggestions;
  };

  const identifyRedFlags = (responses: Record<string, string>): RedFlag[] => {
    const flags = [];
    
    // Extreme positions that might limit compatibility
    if (responses['economic_autonomy'] === 'complete_independence' && 
        responses['domestic_responsibilities'] === 'wife_primarily') {
      flags.push({
        title: 'Contradiction dans les attentes de rôles',
        description: 'Vouloir une indépendance financière complète tout en attendant que l\'épouse gère principalement les tâches domestiques peut créer des tensions.',
        severity: 'important' as const
      });
    }
    
    // Unrealistic timelines
    if (responses['marriage_timeline'] === 'immediately' && 
        responses['children_timeline'] === 'immediately_after_marriage') {
      flags.push({
        title: 'Timeline très accélérée',
        description: 'Des attentes de mariage et d\'enfants immédiats peuvent mettre une pression excessive sur les nouvelles relations.',
        severity: 'warning' as const
      });
    }
    
    // Communication issues
    if (responses['family_decisions'] === 'avoid_conflicts') {
      flags.push({
        title: 'Évitement des conflits',
        description: 'Éviter les conflits plutôt que de les résoudre peut nuire à la communication long terme dans le couple.',
        severity: 'important' as const
      });
    }

    return flags;
  };

  const getIslamicGuidance = (responses: Record<string, string>): IslamicGuidance[] => {
    const categories = [];
    
    // Determine relevant categories based on responses
    if (responses['economic_autonomy'] === 'shared_responsibilities') {
      categories.push('cooperation', 'justice');
    }
    
    if (responses['family_decisions'] === 'consensus_decisions') {
      categories.push('consultation', 'decision_making');
    }
    
    if (responses['domestic_responsibilities'] === 'equal_sharing') {
      categories.push('fairness', 'domestic_responsibilities');
    }
    
    if (responses['career_importance'] === 'very_important') {
      categories.push('education', 'career');
    }
    
    // Get relevant guidance from the database
    const relevantGuidance = getGuidanceByCategory(categories);
    
    // If we have specific guidance, use it, otherwise use random general guidance
    if (relevantGuidance.length > 0) {
      // Convert to our format and take up to 3 items
      return relevantGuidance.slice(0, 3).map(guidance => ({
        title: guidance.title,
        verse: guidance.verse,
        source: guidance.source,
        application: guidance.application
      }));
    }
    
    // Fallback to random guidance
    const randomGuidance = getRandomGuidance(3);
    return randomGuidance.map(guidance => ({
      title: guidance.title,
      verse: guidance.verse,
      source: guidance.source,
      application: guidance.application
    }));
  };

  return {
    insights,
    loading: loading || analyzing
  };
};