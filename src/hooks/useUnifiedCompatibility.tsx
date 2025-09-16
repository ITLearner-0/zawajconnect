import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedCompatibilityResult {
  compatibility_score: number;
  islamic_score: number;
  cultural_score: number;
  personality_score: number;
  matching_reasons: string[];
  potential_concerns: string[];
}

export const useUnifiedCompatibility = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const calculateQuestionnaireCompatibility = async (otherUserId: string): Promise<number> => {
    try {
      // Get both users' responses
      const { data: myResponses } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', user?.id);

      const { data: theirResponses } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', otherUserId);

      const { data: questions } = await supabase
        .from('compatibility_questions')
        .select('question_key, weight')
        .eq('is_active', true);

      if (!myResponses || !theirResponses || !questions) {
        return 60; // Default score when no data available
      }

      let totalWeight = 0;
      let matchedWeight = 0;

      questions.forEach(question => {
        const myResponse = myResponses.find(r => r.question_key === question.question_key);
        const theirResponse = theirResponses.find(r => r.question_key === question.question_key);

        if (myResponse && theirResponse) {
          totalWeight += question.weight;
          
          // Simple matching - exact match scores full weight
          if (myResponse.response_value === theirResponse.response_value) {
            matchedWeight += question.weight;
          }
        }
      });

      return totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 60;

    } catch (error) {
      console.error('Error calculating questionnaire compatibility:', error);
      return 60;
    }
  };

  const calculateDetailedCompatibility = async (
    otherUserId: string,
    preferences?: {
      weight_islamic: number;
      weight_cultural: number;
      weight_personality: number;
    }
  ): Promise<UnifiedCompatibilityResult> => {
    if (!user) {
      return {
        compatibility_score: 0,
        islamic_score: 0,
        cultural_score: 0,
        personality_score: 0,
        matching_reasons: [],
        potential_concerns: []
      };
    }

    try {
      // Calculate base compatibility score from questionnaire responses
      const baseCompatibilityScore = await calculateQuestionnaireCompatibility(otherUserId);
      
      // Get both profiles for detailed analysis
      const [myProfile, theirProfile] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('user_id', otherUserId).maybeSingle()
      ]);

      // Get Islamic preferences for both users
      const [myIslamicPrefs, theirIslamicPrefs] = await Promise.all([
        supabase.from('islamic_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('islamic_preferences').select('*').eq('user_id', otherUserId).maybeSingle()
      ]);

      // Calculate Islamic compatibility
      const islamic_score = calculateIslamicCompatibility(myIslamicPrefs?.data, theirIslamicPrefs?.data);
      
      // Calculate cultural compatibility
      const cultural_score = calculateCulturalCompatibility(myProfile?.data, theirProfile?.data);
      
      // Calculate personality compatibility (based on questionnaire)
      // Ensure personality score is between 0-100
      const personality_score = Math.min(100, Math.max(baseCompatibilityScore || 60, 60));

      // Use provided weights or defaults
      const weights = preferences || {
        weight_islamic: 40,
        weight_cultural: 30,
        weight_personality: 30
      };

      // Normalize weights to ensure they sum to 100
      const totalWeight = weights.weight_islamic + weights.weight_cultural + weights.weight_personality;
      const normalizedWeights = {
        weight_islamic: (weights.weight_islamic / totalWeight) * 100,
        weight_cultural: (weights.weight_cultural / totalWeight) * 100,
        weight_personality: (weights.weight_personality / totalWeight) * 100
      };

      // Calculate weighted overall score and ensure it's between 0-100
      const compatibility_score = Math.min(100, Math.max(0, Math.floor(
        (islamic_score * normalizedWeights.weight_islamic +
         cultural_score * normalizedWeights.weight_cultural +
         personality_score * normalizedWeights.weight_personality) / 100
      )));

      // Generate matching reasons
      const matching_reasons = generateMatchingReasons(
        islamic_score,
        cultural_score,
        personality_score,
        myProfile?.data,
        theirProfile?.data
      );

      // Generate potential concerns
      const potential_concerns = generatePotentialConcerns(
        islamic_score,
        cultural_score,
        personality_score,
        myProfile?.data,
        theirProfile?.data
      );

      return {
        compatibility_score: Math.max(compatibility_score, 0),
        islamic_score,
        cultural_score,
        personality_score,
        matching_reasons,
        potential_concerns
      };

    } catch (error) {
      console.error('Error calculating unified compatibility:', error);
      return {
        compatibility_score: 0,
        islamic_score: 0,
        cultural_score: 0,
        personality_score: 0,
        matching_reasons: [],
        potential_concerns: ['Erreur dans le calcul de compatibilité']
      };
    }
  };

  const calculateIslamicCompatibility = (myPrefs: any, theirPrefs: any): number => {
    // If both have no data, give a neutral score
    if (!myPrefs && !theirPrefs) return 75;
    
    // If only one has data, give a slightly lower but still reasonable score
    if (!myPrefs || !theirPrefs) return 65;

    let score = 60; // Higher base score for users with Islamic preferences

    // Prayer frequency alignment
    if (myPrefs.prayer_frequency === theirPrefs.prayer_frequency) {
      score += 20;
    } else if (
      (myPrefs.prayer_frequency === '5_times_daily' && theirPrefs.prayer_frequency === 'sometimes') ||
      (myPrefs.prayer_frequency === 'sometimes' && theirPrefs.prayer_frequency === '5_times_daily')
    ) {
      score += 10;
    }

    // Sect compatibility
    if (myPrefs.sect === theirPrefs.sect) {
      score += 15;
    }

    // Halal diet compatibility
    if (myPrefs.halal_diet === theirPrefs.halal_diet) {
      score += 10;
    }

    // Importance of religion alignment
    if (myPrefs.importance_of_religion === theirPrefs.importance_of_religion) {
      score += 15;
    }

    // Smoking compatibility
    if (myPrefs.smoking === theirPrefs.smoking) {
      score += 10;
    } else if (myPrefs.smoking === 'never' && theirPrefs.smoking !== 'never') {
      score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  };

  const calculateCulturalCompatibility = (myProfile: any, theirProfile: any): number => {
    if (!myProfile || !theirProfile) return 70; // More optimistic for missing data

    let score = 60; // Higher base score

    // Location proximity
    if (myProfile.location === theirProfile.location) {
      score += 20;
    } else if (myProfile.location && theirProfile.location) {
      // Same region/country logic could be added here
      score += 5;
    }

    // Education level compatibility
    if (myProfile.education && theirProfile.education) {
      score += 10;
    }

    // Age compatibility
    const ageDiff = Math.abs((myProfile.age || 25) - (theirProfile.age || 25));
    if (ageDiff <= 3) {
      score += 15;
    } else if (ageDiff <= 7) {
      score += 10;
    } else if (ageDiff > 10) {
      score -= 10;
    }

    // Shared interests
    if (myProfile.interests && theirProfile.interests) {
      const sharedInterests = myProfile.interests.filter((interest: string) =>
        theirProfile.interests.includes(interest)
      );
      score += Math.min(20, sharedInterests.length * 5);
    }

    return Math.min(100, Math.max(0, score));
  };

  const generateMatchingReasons = (
    islamic_score: number,
    cultural_score: number,
    personality_score: number,
    myProfile: any,
    theirProfile: any
  ): string[] => {
    const reasons: string[] = [];

    if (islamic_score >= 85) reasons.push("Forte compatibilité religieuse");
    if (cultural_score >= 80) reasons.push("Valeurs culturelles partagées");
    if (personality_score >= 85) reasons.push("Personnalités complémentaires");
    
    if (myProfile && theirProfile) {
      if (myProfile.location === theirProfile.location) {
        reasons.push("Proximité géographique");
      }
      
      const ageDiff = Math.abs((myProfile.age || 25) - (theirProfile.age || 25));
      if (ageDiff <= 5) {
        reasons.push("Âges compatibles");
      }

      if (myProfile.interests && theirProfile.interests) {
        const sharedCount = myProfile.interests.filter((interest: string) =>
          theirProfile.interests.includes(interest)
        ).length;
        if (sharedCount >= 2) {
          reasons.push(`${sharedCount} centres d'intérêt partagés`);
        }
      }
    }

    return reasons.slice(0, 3); // Limit to top 3 reasons
  };

  const generatePotentialConcerns = (
    islamic_score: number,
    cultural_score: number,
    personality_score: number,
    myProfile: any,
    theirProfile: any
  ): string[] => {
    const concerns: string[] = [];

    if (islamic_score < 60) concerns.push("Différences dans la pratique religieuse");
    if (cultural_score < 50) concerns.push("Origines culturelles différentes");
    if (personality_score < 40) concerns.push("Personnalités potentiellement incompatibles");

    if (myProfile && theirProfile) {
      const ageDiff = Math.abs((myProfile.age || 25) - (theirProfile.age || 25));
      if (ageDiff > 10) {
        concerns.push("Écart d'âge important");
      }

      if (myProfile.location !== theirProfile.location) {
        concerns.push("Distance géographique");
      }
    }

    return concerns.slice(0, 2); // Limit to top 2 concerns
  };

  const batchCalculateCompatibility = async (
    userIds: string[],
    preferences?: {
      weight_islamic: number;
      weight_cultural: number;
      weight_personality: number;
    }
  ): Promise<Record<string, UnifiedCompatibilityResult>> => {
    setLoading(true);
    try {
      const results: Record<string, UnifiedCompatibilityResult> = {};
      
      // Process in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (userId) => {
            const result = await calculateDetailedCompatibility(userId, preferences);
            return { userId, result };
          })
        );
        
        batchResults.forEach(({ userId, result }) => {
          results[userId] = result;
        });
      }
      
      return results;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateDetailedCompatibility,
    batchCalculateCompatibility,
    loading
  };
};