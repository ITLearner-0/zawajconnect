// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateIslamicCompatibility as calculateIslamicFuzzy,
  calculateCulturalCompatibility as calculateCulturalFuzzy,
  calculateOverallCompatibility
} from '@/utils/matchingAlgorithm';
import { logger } from '@/utils/logger';

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
      logger.error('Error calculating questionnaire compatibility', error);
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
      logger.error('Error calculating unified compatibility', error);
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

  const calculateIslamicCompatibility = (myPrefs: Record<string, unknown>, theirPrefs: Record<string, unknown>): number => {
    // If both have no data, give a neutral score
    if (!myPrefs && !theirPrefs) return 75;

    // If only one has data, give a slightly lower but still reasonable score
    if (!myPrefs || !theirPrefs) return 65;

    try {
      // Use enhanced fuzzy matching algorithm
      const score = calculateIslamicFuzzy(myPrefs, theirPrefs);
      logger.log('Islamic compatibility calculated (fuzzy)', { score, myPrefs, theirPrefs });
      return Math.min(100, Math.max(0, Math.round(score * 100)));
    } catch (error) {
      logger.error('Error in Islamic compatibility calculation', error);
      return 65; // Fallback to neutral score
    }
  };

  const calculateCulturalCompatibility = (myProfile: Record<string, unknown>, theirProfile: Record<string, unknown>): number => {
    if (!myProfile || !theirProfile) return 70; // More optimistic for missing data

    try {
      // Use enhanced fuzzy matching algorithm with location similarity
      const culturalPrefs = {
        location: myProfile.location || '',
        education: myProfile.education || '',
        interests: myProfile.interests || [],
      };

      const theirCulturalPrefs = {
        location: theirProfile.location || '',
        education: theirProfile.education || '',
        interests: theirProfile.interests || [],
      };

      const score = calculateCulturalFuzzy(culturalPrefs, theirCulturalPrefs);
      logger.log('Cultural compatibility calculated (fuzzy)', { score, culturalPrefs, theirCulturalPrefs });
      return Math.min(100, Math.max(0, Math.round(score * 100)));
    } catch (error) {
      logger.error('Error in cultural compatibility calculation', error);
      return 70; // Fallback to optimistic score
    }
  };

  const generateMatchingReasons = (
    islamic_score: number,
    cultural_score: number,
    personality_score: number,
    myProfile: Record<string, unknown>,
    theirProfile: Record<string, unknown>
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
    myProfile: Record<string, unknown>,
    theirProfile: Record<string, unknown>
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