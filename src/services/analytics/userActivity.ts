import { UserActivityStats, DemographicStat, MessageTrend } from '@/types/analytics';

/**
 * Get user activity statistics
 */
export const getUserActivityStats = async (
  fromDate?: string,
  toDate?: string
): Promise<UserActivityStats> => {
  try {
    // Generate sample demographic data
    const demographicStats: DemographicStat[] = [
      { name: '18-24', value: 30 },
      { name: '25-34', value: 45 },
      { name: '35-44', value: 20 },
      { name: '45+', value: 5 },
    ];

    // Generate sample message trends
    const messageTrends: MessageTrend[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      messageTrends.push({
        date: dateString ?? '',
        count: Math.floor(Math.random() * 100) + 20, // Random value for demo
      });
    }

    return {
      activeUsers: 225,
      totalUsers: 450,
      demographicStats,
      messageTrends,
    };
  } catch (err) {
    console.error('Error getting user activity stats:', err);
    return {
      activeUsers: 0,
      totalUsers: 0,
      demographicStats: [],
      messageTrends: [],
    };
  }
};
