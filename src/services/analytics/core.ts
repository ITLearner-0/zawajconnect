
import { AnalyticsData } from '@/types/analytics';

/**
 * Get general analytics data
 */
export const getAnalyticsData = async (
  fromDate?: string,
  toDate?: string
): Promise<AnalyticsData> => {
  try {
    // Using mock data instead of actual database queries
    return {
      totalConversations: 250,
      newConversations: 35,
      totalUsers: 450,
      totalMessages: 8750
    };
  } catch (err) {
    console.error('Error getting analytics data:', err);
    return {
      totalConversations: 0,
      newConversations: 0,
      totalUsers: 0,
      totalMessages: 0
    };
  }
};
