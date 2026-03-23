import { useState, useEffect } from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchCompatibilityResults,
  fetchProfilesData,
  type CompatibilityResult,
  type ProfileData,
} from './useCompatibilityData';
import { calculateCompatibilityScore, type MatchScoreResult } from './useCompatibilityScoring';
import { sortCompatibilityMatches } from './useCompatibilityMatchSorting';

export function useEnhancedCompatibilityMatches() {
  const [matchScores, setMatchScores] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const { myResults, otherResults } = await fetchCompatibilityResults();

        if (!myResults || !otherResults.length) {
          setLoading(false);
          return;
        }

        const profiles = await fetchProfilesData();

        // Calculate compatibility scores for each potential match
        const compatibilityScores = otherResults.map((otherResult) => {
          const scoreResult: MatchScoreResult = calculateCompatibilityScore(
            myResults.answers as Record<string, any>,
            otherResult.answers as Record<string, any>
          );

          // Get profile info
          const profileData = profiles?.find((p) => p.id === otherResult.user_id);

          return {
            userId: otherResult.user_id,
            fullName: profileData
              ? (profileData.full_name || 'Utilisateur')
              : 'Utilisateur',
            score: scoreResult.score,
            compatibilityScore: scoreResult.score,
            profileData: profileData ? { ...profileData } : undefined,
            matchDetails: {
              strengths: scoreResult.strengths,
              differences: scoreResult.differences,
              dealbreakers: scoreResult.dealbreakers.length ? scoreResult.dealbreakers : undefined,
              categoryScores: scoreResult.categoryScores,
            } as any,
          } as any;
        });

        // Sort matches by compatibility and verification status
        const sortedMatches = sortCompatibilityMatches(compatibilityScores);
        setMatchScores(sortedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load compatibility matches',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [toast]);

  return { matchScores, loading };
}
