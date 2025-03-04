
import { supabase } from '@/integrations/supabase/client';
import { executeSql } from '@/utils/database';

/**
 * Gets moderation statistics
 */
export const getModerationStats = async (): Promise<{
  pendingReports: number;
  flaggedContent: number;
  totalProcessed: number;
  resolvedToday: number;
}> => {
  const defaults = {
    pendingReports: 0,
    flaggedContent: 0,
    totalProcessed: 0,
    resolvedToday: 0
  };
  
  try {
    // Get pending reports count
    const { count: pendingReportsCount, error: pendingError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // Get unresolved flags count
    const { count: flaggedContentCount, error: flaggedError } = await supabase
      .from('content_flags')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);
    
    // Get total processed count
    const { count: totalProcessedCount, error: processedError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');
    
    // Get resolved today count using SQL function
    const todayQuery = `
      SELECT COUNT(*) 
      FROM content_reports 
      WHERE status = 'resolved' 
      AND DATE(resolved_at) = CURRENT_DATE
    `;
    const resolvedTodayResult = await executeSql(todayQuery);
    const resolvedTodayCount = resolvedTodayResult?.count || 0;
    
    if (pendingError || flaggedError || processedError) {
      console.error('Error getting moderation stats');
      return defaults;
    }
    
    return {
      pendingReports: pendingReportsCount || 0,
      flaggedContent: flaggedContentCount || 0,
      totalProcessed: totalProcessedCount || 0,
      resolvedToday: resolvedTodayCount
    };
  } catch (err) {
    console.error('Error getting moderation stats:', err);
    return defaults;
  }
};
