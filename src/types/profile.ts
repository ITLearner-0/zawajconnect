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

// Database profile interface — mirrors the `profiles` table.
// The table has a single `full_name` column (no first_name / last_name).
export interface DatabaseProfile {
  id: string;
  user_id?: string;
  full_name: string;
  gender: string;
  birth_date?: string;
  age?: number;
  location?: string;
  education_level?: string;
  occupation?: string;
  religious_practice_level?: string;
  madhab?: string;
  prayer_frequency?: string;
  bio?: string;
  about_me?: string;
  looking_for?: string;
  wali_name?: string;
  wali_relationship?: string;
  wali_contact?: string;
  profile_picture?: string;
  avatar_url?: string;
  gallery?: string[];
  interests?: string[];
  polygamy_stance?: string;
  languages?: string[];
  marital_status?: string;
  has_children?: boolean;
  nationality?: string;
  mother_tongue?: string;
  religious_level?: string;
  niyyah_stated_at?: string;
  spoken_languages?: string[];
  preferred_languages?: string[];
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  wali_verified: boolean;
  privacy_settings?: PrivacySettings;
  is_visible: boolean;
  is_verified: boolean;
  blocked_users?: string[];
  content_flags?: any[];
  moderation_status?: string;
  last_moderation_date?: string;
  photo_blur_settings?: {
    blur_profile_picture: boolean;
    blur_gallery_photos: boolean;
    blur_until_approved: boolean;
    blur_for_non_matches: boolean;
  };
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
    first_name: string;
    last_name: string;
    profile_picture?: string;
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
