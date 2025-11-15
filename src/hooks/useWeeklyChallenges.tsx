import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  challenge_type: string;
  title: string;
  description: string;
  target_value: number;
  xp_reward: number;
  week_start: string;
  week_end: string;
}

interface ChallengeProgress {
  challenge_id: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
}

export const useWeeklyChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, ChallengeProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get active challenges for current week
    const { data: challengesData } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('is_active', true)
      .gte('week_end', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: true });

    if (challengesData) {
      setChallenges(challengesData);

      // Get user progress for these challenges
      const challengeIds = challengesData.map((c) => c.id);
      const { data: progressData } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('challenge_id', challengeIds);

      if (progressData) {
        const progressMap = new Map(
          progressData.map((p) => [
            p.challenge_id,
            {
              challenge_id: p.challenge_id,
              current_progress: p.current_progress,
              completed: p.completed,
              completed_at: p.completed_at,
            },
          ])
        );
        setUserProgress(progressMap);
      }
    }

    setLoading(false);
  };

  const updateChallengeProgress = useCallback(
    async (challengeType: string, incrementBy: number = 1) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const challenge = challenges.find((c) => c.challenge_type === challengeType);
      if (!challenge) return;

      const currentProgress = userProgress.get(challenge.id);
      const newProgress = (currentProgress?.current_progress || 0) + incrementBy;
      const isCompleted = newProgress >= challenge.target_value;

      const { data, error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challenge.id,
          current_progress: newProgress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating challenge progress:', error);
        return;
      }

      if (data) {
        setUserProgress((prev) =>
          new Map(prev).set(challenge.id, {
            challenge_id: data.challenge_id,
            current_progress: data.current_progress,
            completed: data.completed,
            completed_at: data.completed_at,
          })
        );

        // If just completed, award XP and show celebration
        if (isCompleted && !currentProgress?.completed) {
          // Add XP (will be handled by parent component with useUserLevel)
          await supabase.rpc('add_user_xp', {
            p_user_id: user.id,
            p_xp_amount: challenge.xp_reward,
          });

          toast({
            title: '🎯 Défi Complété!',
            description: (
              <div className="space-y-1">
                <p className="font-semibold">{challenge.title}</p>
                <p className="text-sm">+{challenge.xp_reward} XP</p>
              </div>
            ),
            duration: 5000,
          });
        }
      }
    },
    [challenges, userProgress, toast]
  );

  const getChallengeProgress = (challengeId: string) => {
    return userProgress.get(challengeId);
  };

  return {
    challenges,
    userProgress,
    loading,
    updateChallengeProgress,
    getChallengeProgress,
    refreshChallenges: loadChallenges,
  };
};
