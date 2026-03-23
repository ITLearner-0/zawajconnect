export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  id: boolean;
  wali: boolean;
}

export interface PrivacySettings {
  profileVisibilityLevel: number;
  showAge: boolean;
  showLocation: boolean;
  showOccupation: boolean;
  allowNonMatchMessages: boolean;
}

export interface ProfileFormData {
  fullName: string;
  age: string;
  gender: string;
  location: string;
  education: string;
  occupation: string;
  religiousLevel: string;
  madhab?: string;
  prayerFrequency: string;
  familyBackground: string;
  aboutMe: string;
  waliName: string;
  waliRelationship: string;
  waliContact: string;
  gallery: string[];
  polygamyStance?: string;
  profilePicture?: string;
  languages?: string[];
  maritalStatus?: string;
  hasChildren?: string;
  nationality?: string;
  motherTongue?: string;
  spokenLanguages?: string[];
  preferredLanguages?: string[];
}

// Database profile interface — mirrors the actual `profiles` table columns.
export interface DatabaseProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  gender: string | null;
  age: number | null;
  location?: string | null;
  education?: string | null;
  profession?: string | null;
  bio?: string | null;
  looking_for?: string | null;
  avatar_url?: string | null;
  interests?: string[];
  marital_status?: string | null;
  has_children?: boolean | null;
  nationality?: string | null;
  mother_tongue?: string | null;
  religious_level?: string | null;
  niyyah_stated_at?: string | null;
  onboarding_completed?: boolean | null;
  phone?: string | null;
  privacy_settings?: PrivacySettings | null;
  is_visible?: boolean | null;
  is_wali?: boolean | null;
  blocked_users?: string[];
  supervised_by_wali_id?: string | null;
  wali_approval_required?: boolean | null;
  wali_registration_id?: string | null;
  wali_supervision_level?: string | null;
  terms_accepted_at?: string | null;
  terms_version?: string | null;
  created_at: string;
  updated_at: string;
}

// Message interfaces
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  encrypted?: boolean;
  is_filtered?: boolean;
  attachments?: string[];
  content_flags?: any;
  is_wali_visible?: boolean;
  scheduled_deletion?: string;
  iv?: string;
}

// Conversation interfaces
export interface Conversation {
  id: string;
  participants: string[];
  wali_supervised: boolean;
  created_at: string;
  encryption_enabled?: boolean;
  retention_policy?: RetentionPolicy;
  last_message?: Message;
  profile?: {
    full_name: string | null;
    avatar_url?: string | null;
  };
}

// Video call interfaces
export interface VideoCallStatus {
  isActive: boolean;
  participantId?: string;
  waliPresent?: boolean;
  startTime?: Date;
}

// Retention policy
export interface RetentionPolicy {
  type: 'temporary' | 'permanent';
  auto_delete: boolean;
  duration_days?: number;
}

// Content moderation
export interface ContentFlag {
  id: string;
  content_id: string;
  content_type: string;
  flag_type: string;
  severity: string;
  flagged_by: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}

export interface ContentReport {
  id?: string;
  reported_user_id: string;
  reporting_user_id: string;
  report_type:
    | 'inappropriate_message'
    | 'inappropriate_profile'
    | 'harassment'
    | 'spam'
    | 'impersonation'
    | 'other';
  content_reference?: string;
  report_details: string;
  status?: 'pending' | 'reviewed' | 'resolved';
  created_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  moderator_notes?: string;
}
