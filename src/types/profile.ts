
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
}

export interface VideoCallStatus {
  isActive: boolean;
  participantId?: string;
  waliPresent: boolean;
  startTime?: Date;
}
