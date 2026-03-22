import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrustScoreData {
  publicTrustScore: number;
  profileCompletionScore: number;
  compatibilityTestCompleted: boolean;
}

const DEFAULT: TrustScoreData = {
  publicTrustScore: 0,
  profileCompletionScore: 0,
  compatibilityTestCompleted: false,
};

export const useTrustScore = (userId: string | null) => {
  const [trustData, setTrustData] = useState<TrustScoreData>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTrustScore = async () => {
      try {
        const { data, error } = await supabase
          .from('user_verifications')
          .select('verification_score, email_verified, phone_verified, id_verified, family_verified')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          // Use verification_score as the base, or compute from fields
          const score = (data as any).public_trust_score
            ?? data.verification_score
            ?? 0;

          setTrustData({
            publicTrustScore: score,
            profileCompletionScore: (data as any).profile_completion_score ?? 0,
            compatibilityTestCompleted: (data as any).compatibility_test_completed ?? false,
          });
        }
      } catch (err) {
        console.error('Error fetching trust score:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustScore();
  }, [userId]);

  return { trustData, loading };
};
