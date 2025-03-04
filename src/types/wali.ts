
export interface WaliProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  contact_information: string;
  is_verified: boolean;
  verification_date?: string;
  availability_status: 'available' | 'busy' | 'offline';
  last_active: string;
  managed_users: string[];
  chat_preferences: WaliChatPreferences;
}

export interface WaliChatPreferences {
  auto_approve_known_contacts: boolean;
  notification_level: 'all' | 'important' | 'minimal';
  keyword_alerts: string[];
  supervision_level: 'passive' | 'active' | 'strict';
}

export interface ChatRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_at: string;
  reviewed_at?: string;
  requester_profile?: {
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
  message?: string;
  wali_notes?: string;
  wali_id?: string;
}

export interface SupervisionSession {
  id: string;
  conversation_id: string;
  wali_id: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  notes?: string;
  action_taken?: 'warning' | 'terminated' | 'reported' | 'none';
  supervision_level: 'passive' | 'active' | 'intervening';
}

export interface WaliNotification {
  id: string;
  wali_id: string;
  type: 'chat_request' | 'keyword_alert' | 'conversation_started' | 'system';
  content: string;
  related_id?: string;
  created_at: string;
  is_read: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface WaliDashboardStats {
  pendingRequests: number;
  activeConversations: number;
  flaggedMessages: number;
  totalSupervised: number;
}
