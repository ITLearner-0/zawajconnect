
// General analytics data
export interface AnalyticsData {
  totalConversations: number;
  newConversations: number;
  totalUsers: number;
  totalMessages: number;
}

// Emergency statistics
export interface EmergencyStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  pendingHighPriority: number;
  recentReports: EmergencyReport[];
}

export interface EmergencyReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  conversation_id: string;
  emergency_type: string;
  created_at: string;
  status: 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  action_taken?: string;
}

// Moderation statistics
export interface ModerationStats {
  totalFlags: number;
  totalReports: number;
  flagsByType: FlagByType[];
}

export interface FlagByType {
  type: string;
  count: number;
}

// User activity statistics
export interface UserActivityStats {
  activeUsers: number;
  totalUsers: number;
  demographicStats: DemographicStat[];
  messageTrends: MessageTrend[];
}

export interface DemographicStat {
  name: string;
  value: number;
}

export interface MessageTrend {
  date: string;
  count: number;
}

// Wali statistics
export interface WaliStats {
  totalWalis: number;
  activeWalis: number;
  supervisedConversations: number;
  averageResponseTime: number;
  approvalRate: number;
  supervisionTrends: SupervisionTrend[];
}

export interface SupervisionTrend {
  date: string;
  count: number;
}
