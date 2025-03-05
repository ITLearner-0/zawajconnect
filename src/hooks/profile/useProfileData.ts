
import { useProfileFetcher } from './useProfileFetcher';
import { useProfileUpdater } from './useProfileUpdater';
import { ProfileFormData } from '@/types/profile';

export const useProfileData = (userId?: string | null) => {
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

  // Use the profile updater hook to update profile data
  const { 
    updateProfileData, 
    loading: updateLoading, 
    error: updateError 
  } = useProfileUpdater(userId);

  return {
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
};
