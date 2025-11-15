import { WaliStats, SupervisionTrend } from '@/types/analytics';

/**
 * Get wali statistics
 */
export const getWaliStats = async (fromDate?: string, toDate?: string): Promise<WaliStats> => {
  try {
    // Generate sample supervision trends
    const supervisionTrends: SupervisionTrend[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      supervisionTrends.push({
        date: dateString ?? '',
        count: Math.floor(Math.random() * 20) + 5, // Random value for demo
      });
    }

    return {
      totalWalis: 75,
      activeWalis: 45,
      supervisedConversations: 120,
      averageResponseTime: 3.2, // Sample value
      approvalRate: 78, // Sample value
      supervisionTrends,
    };
  } catch (err) {
    console.error('Error getting wali stats:', err);
    return {
      totalWalis: 0,
      activeWalis: 0,
      supervisedConversations: 0,
      averageResponseTime: 0,
      approvalRate: 0,
      supervisionTrends: [],
    };
  }
};
