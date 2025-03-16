
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

/**
 * Get emergency statistics
 */
export const getEmergencyStats = async (
  fromDate?: string,
  toDate?: string
): Promise<EmergencyStats> => {
  try {
    // Sample data for demonstration
    const mockReports: EmergencyReport[] = [
      {
        id: '1',
        reporter_id: 'user-123',
        reported_user_id: 'user-456',
        conversation_id: 'conv-123',
        emergency_type: 'immediate_threat',
        created_at: new Date().toISOString(),
        status: 'pending',
        priority: 'high'
      },
      {
        id: '2',
        reporter_id: 'user-124',
        reported_user_id: 'user-457',
        conversation_id: 'conv-124',
        emergency_type: 'harassment',
        created_at: new Date(Date.now() - 8600000).toISOString(),
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '3',
        reporter_id: 'user-125',
        reported_user_id: 'user-458',
        conversation_id: 'conv-125',
        emergency_type: 'suspicious_behavior',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'resolved',
        priority: 'medium',
        resolved_by: 'admin-1',
        resolved_at: new Date(Date.now() - 86400000).toISOString(),
        resolution_notes: 'False alarm',
        action_taken: 'no_action'
      }
    ];
    
    return {
      totalReports: 35,
      pendingReports: 12,
      resolvedReports: 23,
      pendingHighPriority: 3,
      recentReports: mockReports
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
    // Generate sample demographic data
    const demographicStats: DemographicStat[] = [
      { name: '18-24', value: 30 },
      { name: '25-34', value: 45 },
      { name: '35-44', value: 20 },
      { name: '45+', value: 5 }
    ];
    
    // Generate sample message trends
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
    
    return {
      activeUsers: 225,
      totalUsers: 450,
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
    // Generate sample flags by type
    const flagsByType: FlagByType[] = [
      { type: 'inappropriate', count: 32 },
      { type: 'harassment', count: 18 },
      { type: 'religious_violation', count: 24 },
      { type: 'suspicious', count: 12 }
    ];
    
    return {
      totalFlags: 86,
      totalReports: 42,
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
    // Generate sample supervision trends
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
    
    return {
      totalWalis: 75,
      activeWalis: 45,
      supervisedConversations: 120,
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
