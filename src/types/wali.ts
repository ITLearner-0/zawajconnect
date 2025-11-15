import { Message } from '@/types/profile';

export interface WaliProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  contact_information: string;
  is_verified: boolean;
  verification_date?: string;
  availability_status: 'online' | 'away' | 'busy' | 'offline';
  last_active: string;
  managed_users?: string[];
  chat_preferences?: {
    auto_approve_known_contacts: boolean;
    notification_level: 'all' | 'important' | 'none';
    keyword_alerts: string[];
    supervision_level: 'active' | 'passive' | 'minimal';
  };
}

export interface ChatRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  wali_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  wali_notes?: string;
  message?: string;
  request_type?: 'message' | 'video';
  suggested_time?: string;
  requester_profile?: {
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
}

export interface SupervisionSession {
  id: string;
  conversation_id: string;
  wali_id: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  supervision_level: 'active' | 'passive' | 'minimal';
}

export interface SupervisedConversation {
  id: string;
  participants: string[];
  participant_names?: string[];
  created_at: string;
  last_message_at?: string;
  supervisionId: string;
  supervisionStarted: string;
  supervisionLevel: 'active' | 'passive' | 'minimal';
}

export interface FlaggedItem {
  id: string;
  message_id: string;
  message: Message;
  conversation_id: string;
  flag_reason: string;
  flagged_at: string;
  flagged_by: string;
  status: 'pending' | 'resolved';
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface WaliNotification {
  id: string;
  wali_id: string;
  type: 'chat_request' | 'flag' | 'message' | 'system';
  content: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WaliDashboardStats {
  pendingRequests: number;
  activeConversations: number;
  flaggedMessages: number;
  totalSupervised: number;
}

export interface WaliChatSettings {
  autoApproveKnownContacts: boolean;
  notificationLevel: 'all' | 'important' | 'none';
  keywordAlerts: string[];
  supervisionLevel: 'active' | 'passive' | 'minimal';
}

export interface WaliAction {
  id: string;
  wali_id: string;
  action_type: 'approve' | 'reject' | 'flag' | 'intervene' | 'message';
  target_id: string;
  target_type: 'conversation' | 'message' | 'user';
  performed_at: string;
  notes?: string;
}

export type { Message };
