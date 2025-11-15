import { ModerationStats, FlagByType } from '@/types/analytics';

/**
 * Get moderation statistics
 */
export const getModerationStats = async (
  fromDate?: string,
  toDate?: string
): Promise<ModerationStats> => {
  try {
    // Generate sample flags by type
    const flagsByType: FlagByType[] = [
      { type: 'inappropriate', count: 32 },
      { type: 'harassment', count: 18 },
      { type: 'religious_violation', count: 24 },
      { type: 'suspicious', count: 12 },
    ];

    return {
      totalFlags: 86,
      totalReports: 42,
      flagsByType,
    };
  } catch (err) {
    console.error('Error getting moderation stats:', err);
    return {
      totalFlags: 0,
      totalReports: 0,
      flagsByType: [],
    };
  }
};
