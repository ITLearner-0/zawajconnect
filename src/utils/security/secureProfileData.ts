import { sanitizeText, sanitizeHtml, profileValidationSchema } from './enhancedValidation';
import { ProfileFormData } from '@/types/profile';

export const secureProfileData = (data: Partial<ProfileFormData>): Partial<ProfileFormData> => {
  const securedData: Partial<ProfileFormData> = {};

  // Sanitize and validate each field
  if (data.fullName) {
    securedData.fullName = sanitizeText(data.fullName);
  }

  if (data.aboutMe) {
    securedData.aboutMe = sanitizeHtml(data.aboutMe);
  }

  if (data.location) {
    securedData.location = sanitizeText(data.location);
  }

  if (data.occupation) {
    securedData.occupation = sanitizeText(data.occupation);
  }

  if (data.education) {
    securedData.education = sanitizeText(data.education);
  }

  if (data.religiousLevel) {
    securedData.religiousLevel = sanitizeText(data.religiousLevel);
  }

  if (data.familyBackground) {
    securedData.familyBackground = sanitizeText(data.familyBackground);
  }

  if (data.prayerFrequency) {
    securedData.prayerFrequency = sanitizeText(data.prayerFrequency);
  }

  // Wali information
  if (data.waliName) {
    securedData.waliName = sanitizeText(data.waliName);
  }

  if (data.waliRelationship) {
    securedData.waliRelationship = sanitizeText(data.waliRelationship);
  }

  if (data.waliContact) {
    securedData.waliContact = sanitizeText(data.waliContact);
  }

  // Copy over safe fields
  if (data.age) securedData.age = data.age;
  if (data.gender) securedData.gender = data.gender;
  if (data.profilePicture) securedData.profilePicture = data.profilePicture;

  return securedData;
};

export const validateProfileData = (
  data: Partial<ProfileFormData>
): {
  isValid: boolean;
  errors: string[];
} => {
  try {
    // Convert ProfileFormData to the expected validation schema format
    const validationData = {
      firstName: data.fullName?.split(' ')[0] || '',
      lastName: data.fullName?.split(' ').slice(1).join(' ') || '',
      aboutMe: data.aboutMe,
      location: data.location,
      occupation: data.occupation,
    };

    profileValidationSchema.parse(validationData);
    return { isValid: true, errors: [] };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || [
      'Validation failed',
    ];
    return { isValid: false, errors };
  }
};
