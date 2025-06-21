
export interface WaliInvitation {
  id: string;
  wali_profile_id: string;
  managed_user_id: string;
  invitation_token: string;
  email: string;
  status: 'pending' | 'confirmed' | 'expired' | 'rejected';
  sent_at: string;
  expires_at: string;
  confirmed_at?: string;
  created_at: string;
}

export interface SupervisionSettings {
  require_approval_for_new_conversations: boolean;
  receive_all_messages: boolean;
  can_end_conversations: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  auto_approve_known_contacts: boolean;
}

export interface WaliProfileExtended {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  contact_information: string;
  is_verified: boolean;
  invitation_status: 'pending' | 'sent' | 'confirmed' | 'expired';
  invitation_sent_at?: string;
  invitation_token?: string;
  confirmed_at?: string;
  supervision_level: 'minimal' | 'moderate' | 'strict';
  supervision_settings: SupervisionSettings;
  availability_status: 'online' | 'away' | 'busy' | 'offline';
  last_active: string;
  managed_users?: string[];
}
