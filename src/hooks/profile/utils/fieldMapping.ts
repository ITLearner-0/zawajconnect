
import { ProfileFormData } from '@/types/profile';

// Helper function to map form field names to database field names
export const getDbFieldName = (field: string): string => {
  const fieldMap: Record<string, string> = {
    gender: 'gender',
    location: 'location',
    education: 'education_level',
    occupation: 'occupation',
    religiousLevel: 'religious_practice_level',
    prayerFrequency: 'prayer_frequency',
    polygamyStance: 'polygamy_stance',
    aboutMe: 'about_me',
    waliName: 'wali_name',
    waliRelationship: 'wali_relationship',
    waliContact: 'wali_contact',
    madhab: 'madhab'
  };
  return fieldMap[field] || field;
};

export const mapProfileDataToDatabase = (
  userId: string,
  profileData: ProfileFormData,
  firstName: string,
  lastName: string,
  birthDate: string | null
) => {
  const updateData: any = {
    id: userId,
    first_name: firstName || null,
    last_name: lastName || null,
    privacy_settings: {
      profileVisibilityLevel: 1,
      showAge: true,
      showLocation: true,
      showOccupation: true,
      allowNonMatchMessages: true
    },
    is_visible: true,
    updated_at: new Date().toISOString()
  };

  // Add birth date if available
  if (birthDate) updateData.birth_date = birthDate;

  // Handle string fields with explicit type checking
  const stringFields = [
    'gender', 'location', 'education', 'occupation', 'religiousLevel', 
    'prayerFrequency', 'polygamyStance', 'aboutMe', 'waliName', 
    'waliRelationship', 'waliContact', 'madhab'
  ] as const;

  stringFields.forEach(field => {
    const value = profileData[field as keyof ProfileFormData];
    if (value && typeof value === 'string' && value.trim()) {
      const dbField = getDbFieldName(field);
      updateData[dbField] = value.trim();
    }
  });

  return updateData;
};
