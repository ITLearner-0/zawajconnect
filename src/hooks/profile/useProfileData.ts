import { useProfileFetcher } from './useProfileFetcher';
import { ProfileFormData } from '@/types/profile';

export const useProfileData = (userId?: string | null) => {
  console.log('useProfileData: Hook started with userId:', userId);

  // Use only the profile fetcher hook to get profile data
  const {
    profileData,
    loading,
    error,
    isNewUser,
    userEmail,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
  } = useProfileFetcher(userId);

  console.log('useProfileData: useProfileFetcher returned:', {
    profileData: !!profileData,
    loading,
    error,
    isNewUser,
  });

  const finalData = {
    profileData,
    loading,
    error,
    isNewUser,
    userEmail,
    formData: profileData as ProfileFormData,
    verificationStatus,
    userId,
    privacySettings,
    blockedUsers,
    isAccountVisible,
  };

  console.log('useProfileData: Returning final data:', {
    profileData: !!finalData.profileData,
    loading: finalData.loading,
    error: finalData.error,
  });

  return finalData;
};
