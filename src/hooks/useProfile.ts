
import { useProfileData } from "./useProfileData";
import { useProfileForm } from "./useProfileForm";

export const useProfile = () => {
  const { 
    isNewUser, 
    userEmail, 
    formData: initialFormData, 
    verificationStatus: initialVerificationStatus,
    userId,
    privacySettings: initialPrivacySettings,
    blockedUsers: initialBlockedUsers,
    isAccountVisible: initialIsVisible
  } = useProfileData();

  const {
    formData,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    handleChange,
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSubmit,
    handleSignOut,
    toggleAccountVisibility,
    unblockUser,
  } = useProfileForm({
    initialFormData,
    initialVerificationStatus,
    initialPrivacySettings,
    initialBlockedUsers,
    initialIsVisible,
  });

  return {
    formData,
    isNewUser,
    userEmail,
    userId,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    handleChange,
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSubmit,
    handleSignOut,
    toggleAccountVisibility,
    unblockUser,
  };
};
