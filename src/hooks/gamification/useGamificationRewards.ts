import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GamificationReward, RewardType } from '@/types/gamification';

export const useGamificationRewards = (userId?: string) => {
  const [rewards, setRewards] = useState<GamificationReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchRewards();
  }, [userId]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('gamification_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rewards';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (rewardId: string) => {
    try {
      setClaiming(rewardId);

      const { error: updateError } = await (supabase as any)
        .from('gamification_rewards')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq('id', rewardId)
        .eq('user_id', userId)
        .eq('claimed', false);

      if (updateError) throw updateError;

      // Update local state
      setRewards(prev => 
        prev.map(reward => 
          reward.id === rewardId 
            ? { ...reward, claimed: true, claimed_at: new Date().toISOString() }
            : reward
        )
      );

      toast({
        title: 'Reward Claimed!',
        description: 'Your reward has been successfully claimed.',
      });

      return true;
    } catch (err) {
      console.error('Error claiming reward:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim reward';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setClaiming(null);
    }
  };

  const getUnclaimedRewards = (): GamificationReward[] => {
    const now = new Date();
    return rewards.filter(
      reward => 
        !reward.claimed && 
        (!reward.expires_at || new Date(reward.expires_at) > now)
    );
  };

  const getClaimedRewards = (): GamificationReward[] => {
    return rewards.filter(reward => reward.claimed);
  };

  const getExpiredRewards = (): GamificationReward[] => {
    const now = new Date();
    return rewards.filter(
      reward => 
        !reward.claimed && 
        reward.expires_at && 
        new Date(reward.expires_at) <= now
    );
  };

  const getRewardsByType = (type: RewardType): GamificationReward[] => {
    return rewards.filter(reward => reward.reward_type === type);
  };

  const getTotalUnclaimedValue = (): number => {
    return getUnclaimedRewards().reduce(
      (sum, reward) => sum + (reward.reward_amount || 0), 
      0
    );
  };

  return {
    rewards,
    loading,
    claiming,
    error,
    refetch: fetchRewards,
    claimReward,
    getUnclaimedRewards,
    getClaimedRewards,
    getExpiredRewards,
    getRewardsByType,
    getTotalUnclaimedValue,
  };
};
