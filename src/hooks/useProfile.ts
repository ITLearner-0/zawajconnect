
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
    isNewUser, 
    userEmail, 
    formData: initialFormData, 
    verificationStatus: initialVerificationStatus,
    privacySettings: initialPrivacySettings,
    blockedUsers: initialBlockedUsers,
    isAccountVisible: initialIsVisible
  } = useProfileData(userId);

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
    userId
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
