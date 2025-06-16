
import { sanitizeText, sanitizeHtml } from './enhancedValidation';
import { ProfileFormData } from '@/types/profile';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeProfileData = (data: Partial<ProfileFormData>): Partial<ProfileFormData> => {
  const sanitizedData: Partial<ProfileFormData> = {};

  // Sanitize text fields
  if (data.fullName !== undefined) {
    sanitizedData.fullName = sanitizeText(data.fullName);
  }
  if (data.location !== undefined) {
    sanitizedData.location = sanitizeText(data.location);
  }
  if (data.education !== undefined) {
    sanitizedData.education = sanitizeText(data.education);
  }
  if (data.occupation !== undefined) {
    sanitizedData.occupation = sanitizeText(data.occupation);
  }
  if (data.religiousLevel !== undefined) {
    sanitizedData.religiousLevel = sanitizeText(data.religiousLevel);
  }
  if (data.familyBackground !== undefined) {
    sanitizedData.familyBackground = sanitizeText(data.familyBackground);
  }
  if (data.prayerFrequency !== undefined) {
    sanitizedData.prayerFrequency = sanitizeText(data.prayerFrequency);
  }
  if (data.waliName !== undefined) {
    sanitizedData.waliName = sanitizeText(data.waliName);
  }
  if (data.waliRelationship !== undefined) {
    sanitizedData.waliRelationship = sanitizeText(data.waliRelationship);
  }
  if (data.waliContact !== undefined) {
    sanitizedData.waliContact = sanitizeText(data.waliContact);
  }

  // Sanitize HTML content
  if (data.aboutMe !== undefined) {
    sanitizedData.aboutMe = sanitizeHtml(data.aboutMe);
  }

  // Copy over safe fields without modification
  if (data.age !== undefined) sanitizedData.age = data.age;
  if (data.gender !== undefined) sanitizedData.gender = data.gender;
  if (data.profilePicture !== undefined) sanitizedData.profilePicture = data.profilePicture;

  return sanitizedData;
};
