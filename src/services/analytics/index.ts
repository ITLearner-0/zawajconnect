
import { supabase } from '@/integrations/supabase/client';
import { 
  AnalyticsData, 
  EmergencyStats, 
  ModerationStats, 
  UserActivityStats, 
  WaliStats,
  MessageTrend,
  DemographicStat,
  FlagByType,
  EmergencyReport,
  SupervisionTrend
} from '@/types/analytics';

/**
 * Get general analytics data
 */
export const getAnalyticsData = async (
  fromDate?: string,
  toDate?: string
): Promise<AnalyticsData> => {
  try {
    // Get total conversations
    const { count: totalConversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    // Get new conversations in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newConversations, error: newConversationsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());
    
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Get total messages
    const { count: totalMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    if (conversationsError || newConversationsError || usersError || messagesError) {
      console.error('Error fetching analytics data');
      throw new Error('Failed to fetch analytics data');
    }
    
    return {
      totalConversations: totalConversations || 0,
      newConversations: newConversations || 0,
      totalUsers: totalUsers || 0,
      totalMessages: totalMessages || 0
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

/**
 * Get emergency statistics
 */
export const getEmergencyStats = async (
  fromDate?: string,
  toDate?: string
): Promise<EmergencyStats> => {
  try {
    // Get total emergency reports
    const { count: totalReports, error: totalError } = await supabase
      .from('emergency_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    // Get pending reports
    const { count: pendingReports, error: pendingError } = await supabase
      .from('emergency_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    // Get resolved reports
    const { count: resolvedReports, error: resolvedError } = await supabase
      .from('emergency_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    // Get high priority pending reports
    const { count: pendingHighPriority, error: highPriorityError } = await supabase
      .from('emergency_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('priority', 'high');
    
    // Get recent reports
    const { data: recentReports, error: recentError } = await supabase
      .from('emergency_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (totalError || pendingError || resolvedError || highPriorityError || recentError) {
      console.error('Error fetching emergency stats');
      throw new Error('Failed to fetch emergency statistics');
    }
    
    return {
      totalReports: totalReports || 0,
      pendingReports: pendingReports || 0,
      resolvedReports: resolvedReports || 0,
      pendingHighPriority: pendingHighPriority || 0,
      recentReports: recentReports as EmergencyReport[] || []
    };
  } catch (err) {
    console.error('Error getting emergency stats:', err);
    return {
      totalReports: 0,
      pendingReports: 0,
      resolvedReports: 0,
      pendingHighPriority: 0,
      recentReports: []
    };
  }
};

/**
 * Get user activity statistics
 */
export const getUserActivityStats = async (
  fromDate?: string,
  toDate?: string
): Promise<UserActivityStats> => {
  try {
    // Get active users (sent a message in the last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: activeUsers, error: activeError } = await supabase
      .from('messages')
      .select('sender_id', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())
      .is('deleted_at', null);
    
    // Get total users
    const { count: totalUsers, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Generate sample demographic data (in a real app, this would come from the database)
    const demographicStats: DemographicStat[] = [
      { name: '18-24', value: 30 },
      { name: '25-34', value: 45 },
      { name: '35-44', value: 20 },
      { name: '45+', value: 5 }
    ];
    
    // Generate sample message trends (in a real app, this would come from the database)
    const messageTrends: MessageTrend[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      messageTrends.push({
        date: dateString,
        count: Math.floor(Math.random() * 100) + 20 // Random value for demo
      });
    }
    
    if (activeError || totalError) {
      console.error('Error fetching user activity stats');
      throw new Error('Failed to fetch user activity statistics');
    }
    
    return {
      activeUsers: activeUsers || 0,
      totalUsers: totalUsers || 0,
      demographicStats,
      messageTrends
    };
  } catch (err) {
    console.error('Error getting user activity stats:', err);
    return {
      activeUsers: 0,
      totalUsers: 0,
      demographicStats: [],
      messageTrends: []
    };
  }
};

/**
 * Get moderation statistics
 */
export const getModerationStats = async (
  fromDate?: string,
  toDate?: string
): Promise<ModerationStats> => {
  try {
    // Get total content flags
    const { count: totalFlags, error: flagsError } = await supabase
      .from('content_flags')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    // Get total content reports
    const { count: totalReports, error: reportsError } = await supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fromDate || '1900-01-01')
      .lte('created_at', toDate || new Date().toISOString());
    
    // Generate sample flags by type (in a real app, this would come from the database)
    const flagsByType: FlagByType[] = [
      { type: 'inappropriate', count: 32 },
      { type: 'harassment', count: 18 },
      { type: 'religious_violation', count: 24 },
      { type: 'suspicious', count: 12 }
    ];
    
    if (flagsError || reportsError) {
      console.error('Error fetching moderation stats');
      throw new Error('Failed to fetch moderation statistics');
    }
    
    return {
      totalFlags: totalFlags || 0,
      totalReports: totalReports || 0,
      flagsByType
    };
  } catch (err) {
    console.error('Error getting moderation stats:', err);
    return {
      totalFlags: 0,
      totalReports: 0,
      flagsByType: []
    };
  }
};

/**
 * Get wali statistics
 */
export const getWaliStats = async (
  fromDate?: string,
  toDate?: string
): Promise<WaliStats> => {
  try {
    // Get total walis
    const { count: totalWalis, error: walisError } = await supabase
      .from('wali_profiles')
      .select('*', { count: 'exact', head: true });
    
    // Get active walis (online in the last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { count: activeWalis, error: activeError } = await supabase
      .from('wali_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', oneDayAgo.toISOString());
    
    // Get total supervised conversations
    const { count: supervisedConversations, error: supervisedError } = await supabase
      .from('supervision_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', fromDate || '1900-01-01')
      .lte('started_at', toDate || new Date().toISOString());
    
    // Generate sample supervision trends (in a real app, this would come from the database)
    const supervisionTrends: SupervisionTrend[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      supervisionTrends.push({
        date: dateString,
        count: Math.floor(Math.random() * 20) + 5 // Random value for demo
      });
    }
    
    if (walisError || activeError || supervisedError) {
      console.error('Error fetching wali stats');
      throw new Error('Failed to fetch wali statistics');
    }
    
    return {
      totalWalis: totalWalis || 0,
      activeWalis: activeWalis || 0,
      supervisedConversations: supervisedConversations || 0,
      averageResponseTime: 3.2, // Sample value
      approvalRate: 78, // Sample value
      supervisionTrends
    };
  } catch (err) {
    console.error('Error getting wali stats:', err);
    return {
      totalWalis: 0,
      activeWalis: 0,
      supervisedConversations: 0,
      averageResponseTime: 0,
      approvalRate: 0,
      supervisionTrends: []
    };
  }
};
