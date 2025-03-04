
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
