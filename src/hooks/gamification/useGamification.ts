import { useUserBadges } from './useUserBadges';
import { useGamificationRewards } from './useGamificationRewards';

export const useGamification = (userId?: string) => {
  const badges = useUserBadges(userId);
  const rewards = useGamificationRewards(userId);

  const refreshAll = async () => {
    await Promise.all([badges.refetch(), rewards.refetch()]);
  };

  const isLoading = badges.loading || rewards.loading;

  const getGamificationSummary = () => {
    return {
      totalBadges: badges.getTotalBadges(),
      latestBadge: badges.getLatestBadge(),
      unclaimedRewards: rewards.getUnclaimedRewards().length,
      unclaimedValue: rewards.getTotalUnclaimedValue(),
      legendaryBadges: badges.getBadgesByRarity('legendary').length,
      epicBadges: badges.getBadgesByRarity('epic').length,
    };
  };

  return {
    badges,
    rewards,
    isLoading,
    refreshAll,
    getGamificationSummary,
  };
};
