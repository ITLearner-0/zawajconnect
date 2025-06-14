
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CompatibilityMatch } from "@/types/compatibility";
import { questions } from "@/data/compatibilityQuestions";

export interface MatchingFilters {
  ageRange?: [number, number];
  gender?: string;
  location?: string;
  religiousLevel?: string[];
  minCompatibilityScore?: number;
  verifiedOnly?: boolean;
}

export async function findCompatibilityMatches(
  userId: string,
  filters?: MatchingFilters
): Promise<CompatibilityMatch[]> {
  try {
    // Get current user's compatibility results
    const { data: myResults } = await supabase
      .from('compatibility_results')
      .select('answers, preferences')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!myResults) {
      throw new Error("Vous devez d'abord passer le test de compatibilité");
    }

    // Get other users' results with profile data
    const { data: otherUsers, error } = await supabase
      .from('compatibility_results')
      .select(`
        user_id,
        answers,
        preferences,
        profiles!inner(
          first_name,
          last_name,
          gender,
          location,
          birth_date,
          religious_practice_level,
          education_level,
          email_verified,
          phone_verified,
          id_verified,
          is_visible
        )
      `)
      .neq('user_id', userId)
      .eq('profiles.is_visible', true);

    if (error) throw error;

    if (!otherUsers?.length) {
      return [];
    }

    // Apply filters and calculate compatibility scores
    const matches = otherUsers
      .filter(user => applyFilters(user, filters))
      .map(user => calculateEnhancedCompatibilityScore(myResults, user))
      .filter(match => match.score >= (filters?.minCompatibilityScore || 50))
      .sort((a, b) => b.score - a.score);

    return matches.slice(0, 20); // Limit to top 20 matches
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
}

function applyFilters(user: any, filters?: MatchingFilters): boolean {
  if (!filters) return true;

  const profile = user.profiles;
  
  // Age filter
  if (filters.ageRange && profile.birth_date) {
    const age = new Date().getFullYear() - new Date(profile.birth_date).getFullYear();
    if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
      return false;
    }
  }

  // Gender filter
  if (filters.gender && profile.gender !== filters.gender) {
    return false;
  }

  // Location filter
  if (filters.location && !profile.location?.includes(filters.location)) {
    return false;
  }

  // Religious level filter
  if (filters.religiousLevel?.length && 
      !filters.religiousLevel.includes(profile.religious_practice_level)) {
    return false;
  }

  // Verification filter
  if (filters.verifiedOnly && 
      !(profile.email_verified && profile.phone_verified)) {
    return false;
  }

  return true;
}

function calculateEnhancedCompatibilityScore(
  myResults: any,
  otherUser: any
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

function getIslamicWeight(question: any, userWeight?: number): number {
  const baseWeight = userWeight || question.weight;
  
  // Increase weight for critical Islamic values
  const criticalCategories = [
    'Pratique Religieuse',
    'Objectifs Spirituels', 
    'Fidélité',
    'Engagement Long Terme',
    'Valeurs Familiales'
  ];
  
  if (criticalCategories.includes(question.category)) {
    return baseWeight * 1.5; // 50% increase for Islamic priorities
  }
  
  return baseWeight;
}

function calculateCategoryCompatibility(question: any, rawDifference: number): number {
  if (question.isBreaker) {
    // Stricter scoring for dealbreaker questions
    return rawDifference <= 15 ? 100 : Math.max(0, 100 - (rawDifference * 2.5));
  } else {
    // Standard scoring with bonuses for high agreement
    let compatibility = 100 - rawDifference;
    if (rawDifference <= 10) compatibility += 15; // Bonus for very close answers
    else if (rawDifference <= 20) compatibility += 5; // Small bonus for close answers
    return Math.max(0, compatibility);
  }
}

function calculateIslamicBonus(categoryScores: Record<string, { score: number; weight: number }>): number {
  const islamicCategories = [
    'Pratique Religieuse',
    'Objectifs Spirituels',
    'Fidélité',
    'Engagement Long Terme'
  ];
  
  let bonus = 0;
  islamicCategories.forEach(category => {
    if (categoryScores[category]) {
      const categoryPercentage = (categoryScores[category].score / (categoryScores[category].weight * 100)) * 100;
      if (categoryPercentage >= 95) bonus += 8;
      else if (categoryPercentage >= 90) bonus += 5;
      else if (categoryPercentage >= 85) bonus += 3;
    }
  });
  
  return Math.min(15, bonus); // Cap bonus at 15 points
}

export function useCompatibilityMatching() {
  const { toast } = useToast();

  const findMatches = async (filters?: MatchingFilters) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vous devez être connecté pour voir les correspondances");
      }

      return await findCompatibilityMatches(session.user.id, filters);
    } catch (error) {
      console.error('Error in useCompatibilityMatching:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les correspondances",
        variant: "destructive",
      });
      return [];
    }
  };

  return { findMatches };
}
