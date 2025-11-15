import { EmergencyStats, EmergencyReport } from '@/types/analytics';

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
        priority: 'high',
      },
      {
        id: '2',
        reporter_id: 'user-124',
        reported_user_id: 'user-457',
        conversation_id: 'conv-124',
        emergency_type: 'harassment',
        created_at: new Date(Date.now() - 8600000).toISOString(),
        status: 'pending',
        priority: 'medium',
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
        action_taken: 'no_action',
      },
    ];

    return {
      totalReports: 35,
      pendingReports: 12,
      resolvedReports: 23,
      pendingHighPriority: 3,
      recentReports: mockReports,
    };
  } catch (err) {
    console.error('Error getting emergency stats:', err);
    return {
      totalReports: 0,
      pendingReports: 0,
      resolvedReports: 0,
      pendingHighPriority: 0,
      recentReports: [],
    };
  }
};
