import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { PersonalityQuestionnaire } from '@/types/personality';

export const usePersonalityQuestionnaire = () => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<PersonalityQuestionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuestionnaire();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchQuestionnaire = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('personality_questionnaire')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setQuestionnaire(data);
      setIsCompleted(!!data);
    } catch (error) {
      console.error('Error fetching personality questionnaire:', error);
      setIsCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (user) {
      setLoading(true);
      fetchQuestionnaire();
    }
  };

  return {
    questionnaire,
    isCompleted,
    loading,
    refetch,
  };
};
