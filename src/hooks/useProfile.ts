
import { useProfileData } from "./useProfileData";
import { useProfileForm } from "./useProfileForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    
    getUserId();
  }, []);
  
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
  } = useProfileData(userId);

  const {
    formData,
    handleChange,
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSubmit,
    handleSignOut,
    toggleAccountVisibility,
    unblockUser,
  } = useProfileForm({
    initialFormData: profileData,
    initialVerificationStatus: verificationStatus,
    initialPrivacySettings: privacySettings,
    initialBlockedUsers: blockedUsers,
    initialIsVisible: isAccountVisible,
    userId // Pass the actual userId instead of userEmail
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
