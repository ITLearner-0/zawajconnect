import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  CompatibilityQuestionRow,
  UserCompatibilityResponseRow,
  CompatibilityResponse,
  CompatibilityStats,
  WeightedQuestion
} from '@/types/supabase';

export const useCompatibility = () => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<CompatibilityResponse[]>([]);
  const [stats, setStats] = useState<CompatibilityStats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    completionPercentage: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompatibilityData();
    }
  }, [user]);

  /**
   * Charge les données de compatibilité pour l'utilisateur connecté
   */
  const fetchCompatibilityData = async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get total number of active questions with strict typing
      const { count: totalQuestions, error: countError } = await supabase
        .from('compatibility_questions')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (countError) throw countError;

      // Get user responses with strict typing
      const { data: userResponses, error: responsesError } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (responsesError) throw responsesError;

      const answeredQuestions = userResponses?.length ?? 0;
      const completionPercentage = totalQuestions ? (answeredQuestions / totalQuestions) * 100 : 0;
      const lastUpdated = userResponses?.[0]?.updated_at ?? null;

      // Normalize responses to match CompatibilityResponse interface
      const normalizedResponses: CompatibilityResponse[] = (userResponses ?? []).map(response => ({
        question_key: response.question_key,
        response_value: response.response_value,
        updated_at: response.updated_at
      }));

      setResponses(normalizedResponses);
      setStats({
        totalQuestions: totalQuestions ?? 0,
        answeredQuestions,
        completionPercentage,
        lastUpdated
      });

    } catch (err) {
      const error = err as PostgrestError;
      console.error('Error fetching compatibility data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupère la réponse de l'utilisateur pour une question donnée
   * @param questionKey - Clé de la question
   * @returns La valeur de la réponse ou null si non trouvée
   */
  const getResponseValue = (questionKey: string): string | null => {
    const response = responses.find(r => r.question_key === questionKey);
    return response?.response_value ?? null;
  };

  /**
   * Calcule le score de compatibilité avec un autre utilisateur
   * Compare les réponses des deux utilisateurs en tenant compte des poids des questions
   * @param otherUserId - ID de l'autre utilisateur
   * @returns Score de compatibilité entre 0 et 100
   */
  const calculateCompatibilityScore = async (otherUserId: string): Promise<number> => {
    if (!user?.id) {
      return 0;
    }

    try {
      // Get both users' responses with strict typing
      const { data: myResponses, error: myError } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', user.id);

      if (myError) throw myError;

      const { data: theirResponses, error: theirError } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', otherUserId);

      if (theirError) throw theirError;

      const { data: questions, error: questionsError } = await supabase
        .from('compatibility_questions')
        .select('question_key, weight')
        .eq('is_active', true);

      if (questionsError) throw questionsError;

      if (!myResponses || !theirResponses || !questions) {
        return 0;
      }

      let totalWeight = 0;
      let matchedWeight = 0;

      // Normalize questions to WeightedQuestion type
      const weightedQuestions: WeightedQuestion[] = questions.map(q => ({
        question_key: q.question_key,
        weight: q.weight ?? 1 // Default weight to 1 if null
      }));

      weightedQuestions.forEach(question => {
        const myResponse = myResponses.find(r => r.question_key === question.question_key);
        const theirResponse = theirResponses.find(r => r.question_key === question.question_key);

        if (myResponse && theirResponse) {
          totalWeight += question.weight;
          
          // Simple matching - exact match scores full weight
          if (myResponse.response_value === theirResponse.response_value) {
            matchedWeight += question.weight;
          }
          // Partial matching for some questions could be implemented here
          // For now, we use binary matching (match or no match)
        }
      });

      return totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

    } catch (err) {
      const error = err as PostgrestError;
      console.error('Error calculating compatibility score:', error);
      return 0;
    }
  };

  /**
   * Rafraîchit les données de compatibilité
   */
  const refreshData = (): void => {
    if (user) {
      fetchCompatibilityData();
    }
  };

  return {
    responses,
    stats,
    loading,
    getResponseValue,
    calculateCompatibilityScore,
    refreshData
  };
};