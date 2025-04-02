
// Define PrivacySettings as a simple interface with no recursive types
export interface PrivacySettings {
  profileVisibilityLevel: number;
  showAge: boolean;
  showLocation: boolean;
  showOccupation: boolean;
  allowNonMatchMessages: boolean;
  [key: string]: boolean | number; // Simple index signature with primitive types
}

// Define ProfileData without circular references
export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  location: string;
  prayer_frequency: string;
  religious_practice_level: string;
  about_me: string;
  education_level: string;
  occupation: string;
  is_visible: boolean;
  privacy_settings: PrivacySettings;
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  wali_verified: boolean;
  wali_name?: string | null;
  wali_relationship?: string | null;
  wali_contact?: string | null;
  [key: string]: any; // Use a more generic indexer to avoid type recursion
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  waliName?: string;
  waliRelationship?: string;
  waliContact?: string;
}

export interface SignInData {
  email: string;
  password: string;
}
