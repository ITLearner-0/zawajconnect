import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { TrustScoreBreakdown } from '@/components/profile/TrustScoreBadge';

interface TrustScoreData {
  score: number;
  breakdown: TrustScoreBreakdown;
  loading: boolean;
}

export function useTrustScore(userId?: string): TrustScoreData {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [data, setData] = useState<TrustScoreData>({
    score: 0,
    breakdown: {
      emailVerified: false,
      idVerified: false,
      profileCompletionScore: 0,
      loginRegularityScore: 0,
      compatibilityTestCompleted: false,
    },
    loading: true,
  });

  useEffect(() => {
    if (!targetUserId) return;

    const fetchTrustScore = async () => {
      try {
        const { data: verification } = await supabase
          .from('user_verifications')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (verification) {
          const breakdown: TrustScoreBreakdown = {
            emailVerified: verification.email_verified ?? false,
            idVerified: verification.id_verified ?? false,
            profileCompletionScore: (verification as Record<string, unknown>).profile_completion_score as number ?? 0,
            loginRegularityScore: (verification as Record<string, unknown>).login_regularity_score as number ?? 0,
            compatibilityTestCompleted: (verification as Record<string, unknown>).compatibility_test_completed as boolean ?? false,
          };

          const score = (verification as Record<string, unknown>).public_trust_score as number
            ?? verification.verification_score
            ?? 0;

          setData({ score, breakdown, loading: false });
        } else {
          setData((prev) => ({ ...prev, loading: false }));
        }
      } catch {
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchTrustScore();
  }, [targetUserId]);

  return data;
}
