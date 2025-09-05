import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CompatibilityResponse {
  question_key: string;
  response_value: string;
}

interface CompatibilityStats {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  lastUpdated: string | null;
}

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

  const fetchCompatibilityData = async () => {
    try {
      // Get total number of active questions
      const { count: totalQuestions } = await supabase
        .from('compatibility_questions')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Get user responses
      const { data: userResponses, error } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const answeredQuestions = userResponses?.length || 0;
      const completionPercentage = totalQuestions ? (answeredQuestions / totalQuestions) * 100 : 0;
      const lastUpdated = userResponses?.[0]?.updated_at || null;

      setResponses(userResponses || []);
      setStats({
        totalQuestions: totalQuestions || 0,
        answeredQuestions,
        completionPercentage,
        lastUpdated
      });

    } catch (error) {
      console.error('Error fetching compatibility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResponseValue = (questionKey: string): string | null => {
    const response = responses.find(r => r.question_key === questionKey);
    return response?.response_value || null;
  };

  const calculateCompatibilityScore = async (otherUserId: string): Promise<number> => {
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
        return 0;
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
          // Partial matching for some questions could be implemented here
          // For now, we use binary matching (match or no match)
        }
      });

      return totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

    } catch (error) {
      console.error('Error calculating compatibility score:', error);
      return 0;
    }
  };

  const refreshData = () => {
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