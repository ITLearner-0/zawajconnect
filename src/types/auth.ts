
// Authentication related types
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

// Profile data used in authentication flows
export interface AuthProfileData {
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
  privacy_settings: Record<string, any>;
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  wali_verified: boolean;
  wali_name?: string | null;
  wali_relationship?: string | null;
  wali_contact?: string | null;
}
