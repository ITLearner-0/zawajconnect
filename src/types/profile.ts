export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  id: boolean;
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
}
