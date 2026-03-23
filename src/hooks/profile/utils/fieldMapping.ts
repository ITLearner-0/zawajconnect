import { ProfileFormData } from '@/types/profile';

// Maps form field names to actual database column names in the 'profiles' table.
// Fields that belong to 'islamic_preferences' table are excluded here.
const PROFILE_FIELD_MAP: Record<string, string> = {
  gender: 'gender',
  location: 'location',
  education: 'education',
  occupation: 'profession',
  religiousLevel: 'religious_level',
  aboutMe: 'bio',
  hasChildren: 'has_children',
  nationality: 'nationality',
  motherTongue: 'mother_tongue',
  maritalStatus: 'marital_status',
  lookingFor: 'looking_for',
};

// Fields that go to the islamic_preferences table, NOT profiles
const ISLAMIC_PREFS_FIELDS = new Set([
  'prayerFrequency',
  'madhab',
  'polygamyStance',
]);

export const getDbFieldName = (field: string): string => {
  return PROFILE_FIELD_MAP[field] || field;
};

export const mapProfileDataToDatabase = (
  userId: string,
  profileData: ProfileFormData,
  fullName: string,
  _lastName: string,
  birthDate: string | null
): Record<string, any> => {
  console.log('Mapping profile data to database:', {
    userId,
    profileData,
    fullName,
    birthDate,
  });

  // Base required fields — only columns that exist in the profiles table
  const updateData: Record<string, any> = {
    id: userId,
    user_id: userId,
    full_name: fullName || null,
    privacy_settings: {
      profileVisibilityLevel: 1,
      showAge: true,
      showLocation: true,
      showOccupation: true,
      allowNonMatchMessages: true,
    },
    is_visible: true,
    updated_at: new Date().toISOString(),
  };

  // Convert birth_date to age (profiles table has 'age' column, not 'birth_date')
  if (birthDate) {
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    if (calculatedAge > 0 && calculatedAge < 150) {
      updateData.age = calculatedAge;
    }
  } else if (profileData.age) {
    const ageNum = parseInt(profileData.age, 10);
    if (!isNaN(ageNum) && ageNum > 0 && ageNum < 150) {
      updateData.age = ageNum;
    }
  }

  // Map only fields that exist in the profiles table
  const profileFields = Object.keys(PROFILE_FIELD_MAP);

  profileFields.forEach((field) => {
    const value = profileData[field as keyof ProfileFormData];
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (trimmedValue.length > 0) {
          const dbField = getDbFieldName(field);
          updateData[dbField] = trimmedValue;
        }
      } else if (typeof value === 'boolean') {
        const dbField = getDbFieldName(field);
        updateData[dbField] = value;
      }
    }
  });

  console.log('Final mapped data:', updateData);
  return updateData;
};
