
import { useProfileFetcher } from './useProfileFetcher';
import { useProfileUpdater } from './useProfileUpdater';
import { ProfileFormData } from '@/types/profile';

export const useProfileData = (userId?: string | null) => {
  console.log("useProfileData: Hook started with userId:", userId);
  
  // Use the profile fetcher hook to get profile data
  const {
    profileData,
    loading,
    error,
    isNewUser,
    userEmail,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible
  } = useProfileFetcher(userId);

  console.log("useProfileData: useProfileFetcher returned:", {
    profileData: !!profileData,
    loading,
    error,
    isNewUser
  });

  // Use the profile updater hook to update profile data
  const { 
    updateProfileData, 
    loading: updateLoading, 
    error: updateError 
  } = useProfileUpdater(userId);

  const finalData = {
    profileData,
    loading: loading || updateLoading,
    error: error || updateError,
    updateProfileData,
    isNewUser,
    userEmail,
    formData: profileData as ProfileFormData,
    verificationStatus,
    userId,
    privacySettings,
    blockedUsers,
    isAccountVisible
  };

  console.log("useProfileData: Returning final data:", {
    profileData: !!finalData.profileData,
    loading: finalData.loading,
    error: finalData.error
  });

  return finalData;
};
