import { supabase } from '@/integrations/supabase/client';
import { columnExists, executeSql } from '@/utils/database';

// Update to handle data returned from executeSql correctly
export const getModeratedContentCount = async (): Promise<number> => {
  try {
    const result = await executeSql(`
      SELECT COUNT(*) as count
      FROM content_flags
      WHERE resolved = true
    `);

    // Handle different return types from executeSql
    if (result && typeof result !== 'boolean') {
      const data = Array.isArray(result) ? result[0] : result;
      return data?.count ? parseInt(data.count, 10) : 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting moderated content count:', error);
    return 0;
  }
};

// Get pending content reports count
export const getPendingReportsCount = async (): Promise<number> => {
  try {
    const result = await executeSql(`
      SELECT COUNT(*) as count
      FROM content_reports
      WHERE status = 'pending'
    `);

    if (result && typeof result !== 'boolean') {
      const data = Array.isArray(result) ? result[0] : result;
      return data?.count ? parseInt(data.count, 10) : 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting pending reports count:', error);
    return 0;
  }
};

// Get flagged content count
export const getFlaggedContentCount = async (): Promise<number> => {
  try {
    const result = await executeSql(`
      SELECT COUNT(*) as count
      FROM content_flags
      WHERE resolved = false
    `);

    if (result && typeof result !== 'boolean') {
      const data = Array.isArray(result) ? result[0] : result;
      return data?.count ? parseInt(data.count, 10) : 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting flagged content count:', error);
    return 0;
  }
};

// Get resolved content today
export const getResolvedTodayCount = async (): Promise<number> => {
  try {
    const result = await executeSql(`
      SELECT COUNT(*) as count
      FROM content_flags
      WHERE resolved = true
      AND DATE(resolved_at) = CURRENT_DATE
    `);

    if (result && typeof result !== 'boolean') {
      const data = Array.isArray(result) ? result[0] : result;
      return data?.count ? parseInt(data.count, 10) : 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting resolved today count:', error);
    return 0;
  }
};

// Combine all stats into a single function for the admin dashboard
export const getModerationStats = async () => {
  try {
    const [pendingReports, flaggedContent, totalProcessed, resolvedToday] = await Promise.all([
      getPendingReportsCount(),
      getFlaggedContentCount(),
      getModeratedContentCount(),
      getResolvedTodayCount(),
    ]);

    return {
      pendingReports,
      flaggedContent,
      totalProcessed,
      resolvedToday,
    };
  } catch (error) {
    console.error('Error getting moderation stats:', error);
    return {
      pendingReports: 0,
      flaggedContent: 0,
      totalProcessed: 0,
      resolvedToday: 0,
    };
  }
};
