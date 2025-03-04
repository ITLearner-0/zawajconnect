export interface ProfileFormData {
  fullName: string;
  age: string;
  gender: string;
  location: string;
  education: string;
  occupation: string;
  religiousLevel: string;
  familyBackground: string;
  aboutMe: string;
  prayerFrequency: string;
  waliName?: string;
  waliRelationship?: string;
  waliContact?: string;
}

export interface DatabaseProfile {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  location: string;
  education_level: string;
  occupation: string;
  religious_practice_level: string;
  prayer_frequency: string;
  about_me: string;
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  wali_name: string | null;
  wali_relationship: string | null;
  wali_contact: string | null;
  wali_verified: boolean;
  is_visible: boolean;
  privacy_settings: PrivacySettings;
  blocked_users: string[];
  content_flags: ContentFlag[];
  moderation_status: 'approved' | 'pending' | 'rejected';
  last_moderation_date: string | null;
  role?: 'user' | 'admin' | 'moderator';
}

export interface PrivacySettings {
  profileVisibilityLevel: number; // 0=public, 1=moderate, 2=private
  showAge: boolean;
  showLocation: boolean;
  showOccupation: boolean;
  allowNonMatchMessages: boolean;
  [key: string]: boolean | number; // Add index signature for compatibility with Json type
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  id: boolean;
}

export interface Conversation {
  id: string;
  created_at: string;
  participants: string[];
  last_message?: Message;
  profile?: {
    first_name: string;
    last_name: string;
  };
  wali_supervised: boolean;
  retention_policy?: RetentionPolicy; // Added for message retention
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  attachments?: string[];
  is_wali_visible: boolean;
  content_flags?: ContentFlag[];
  is_filtered?: boolean;
  encrypted?: boolean;
  iv?: string; // Initialization vector for encryption
  encryption_key_id?: string; // Reference to the key used
  scheduled_deletion?: string; // ISO date when message should be deleted
  encrypted_for?: string[]; // IDs of users who can decrypt
}

export interface RetentionPolicy {
  type: 'temporary' | 'permanent';
  duration_days?: number; // Number of days to keep messages
  auto_delete: boolean; // Whether to automatically delete messages
}

export interface VideoCallStatus {
  isActive: boolean;
  participantId?: string;
  waliPresent: boolean;
  startTime?: Date;
}

// Content Moderation Types
export interface ContentFlag {
  id?: string;
  content_id: string;
  content_type: 'message' | 'profile' | 'image';
  flag_type: 'inappropriate' | 'harassment' | 'religious_violation' | 'suspicious';
  severity: 'low' | 'medium' | 'high';
  flagged_by: string;
  created_at: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  notes?: string;
}

export interface ContentReport {
  id?: string;
  reported_user_id: string;
  reporting_user_id: string;
  report_type: 'inappropriate_message' | 'inappropriate_profile' | 'harassment' | 'spam' | 'impersonation' | 'other';
  content_reference?: string; // Like message_id or conversation_id
  report_details: string;
  created_at: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolution_action?: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removal' | 'no_action';
}

export interface ModerationStats {
  pendingReports: number;
  flaggedContent: number;
  totalProcessed: number;
  resolvedToday: number;
}
