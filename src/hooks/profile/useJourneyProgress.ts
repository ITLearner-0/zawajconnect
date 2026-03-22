import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JourneyProgressData {
  profileCompleted: boolean;
  compatibilityDone: boolean;
  firstMatch: boolean;
  supervisedExchange: boolean;
  familyMeeting: boolean;
  istikharaCompleted: boolean;
  nikah: boolean;
  currentStep: number;
}

const DEFAULT_PROGRESS: JourneyProgressData = {
  profileCompleted: false,
  compatibilityDone: false,
  firstMatch: false,
  supervisedExchange: false,
  familyMeeting: false,
  istikharaCompleted: false,
  nikah: false,
  currentStep: 1,
};

export const useJourneyProgress = (userId: string | null) => {
  const [progress, setProgress] = useState<JourneyProgressData>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('journey_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          setProgress({
            profileCompleted: data.step_profile_complete ?? false,
            compatibilityDone: data.step_test_complete ?? false,
            firstMatch: data.step_first_match ?? false,
            supervisedExchange: data.step_first_supervised_exchange ?? false,
            familyMeeting: data.step_family_meeting ?? false,
            istikharaCompleted: data.step_istikhara_completed ?? false,
            nikah: data.step_nikah ?? false,
            currentStep: data.current_step ?? 1,
          });
        }
      } catch (err) {
        console.error('Error fetching journey progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  return { progress, loading };
};
