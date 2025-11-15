/**
 * Utility functions to calculate profile completion percentage
 * Used for badge awarding and profile quality assessment
 */

interface IslamicPreferences {
  prayer_frequency?: string | null;
  quran_reading?: string | null;
  madhab?: string | null;
}

interface DatabaseProfile {
  full_name?: string | null;
  bio?: string | null;
  about_me?: string | null;
  education?: string | null;
  education_level?: string | null;
  profession?: string | null;
  occupation?: string | null;
  location?: string | null;
  interests?: string[] | null;
  avatar_url?: string | null;
  profile_picture?: string | null;
}

/**
 * Calculate profile completion percentage based on key profile sections
 * Sections: Basic Info, Bio, Interests, Islamic Preferences, Photo
 */
export const calculateProfileCompletionPercentage = (
  profile: DatabaseProfile,
  islamicPrefs?: IslamicPreferences
): number => {
  let completedSections = 0;
  const totalSections = 5;

  // Section 1: Basic Info (full_name, education, profession, location)
  const hasBasicInfo = Boolean(
    profile.full_name && 
    (profile.education || profile.education_level) && 
    (profile.profession || profile.occupation) && 
    profile.location
  );
  if (hasBasicInfo) completedSections++;

  // Section 2: Bio
  const bioText = profile.bio || profile.about_me || '';
  const hasBio = Boolean(bioText && bioText.length >= 50);
  if (hasBio) completedSections++;

  // Section 3: Interests
  const hasInterests = Boolean(
    profile.interests && 
    Array.isArray(profile.interests) && 
    profile.interests.length >= 3
  );
  if (hasInterests) completedSections++;

  // Section 4: Islamic Preferences
  const hasIslamicPrefs = Boolean(
    islamicPrefs?.prayer_frequency && 
    islamicPrefs?.quran_reading
  );
  if (hasIslamicPrefs) completedSections++;

  // Section 5: Profile Photo
  const hasPhoto = Boolean(profile.avatar_url || profile.profile_picture);
  if (hasPhoto) completedSections++;

  return Math.round((completedSections / totalSections) * 100);
};

/**
 * Determine which badge should be awarded based on completion percentage
 */
export const getCompletionBadgeId = (completionPercentage: number): string | null => {
  if (completionPercentage >= 100) return 'profile_complete_100';
  if (completionPercentage >= 75) return 'profile_complete_75';
  if (completionPercentage >= 50) return 'profile_complete_50';
  if (completionPercentage >= 25) return 'profile_complete_25';
  return null;
};
