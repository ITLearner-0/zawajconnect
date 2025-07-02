
import { useProfileData } from "./profile/useProfileData";
import { useProfileForm } from "./profile/useProfileForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  console.log("useProfile: Hook started");
  
  useEffect(() => {
    if (sessionChecked) return; // Prevent multiple session checks
    
    console.log("useProfile: Getting user session");
    const getUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("useProfile: Session retrieved", !!session?.user?.id);
        if (session?.user?.id) {
          setUserId(session.user.id);
          console.log("useProfile: User ID set", session.user.id);
        }
      } catch (error) {
        console.error("useProfile: Error getting user session:", error);
      } finally {
        setSessionChecked(true);
      }
    };
    
    getUserId();
  }, [sessionChecked]);
  
  console.log("useProfile: About to call useProfileData with userId:", userId);
  
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

  console.log("useProfile: useProfileData returned:", {
    profileData: !!profileData,
    loading,
    error,
    isNewUser,
    userEmail
  });

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
    userId
  });

  console.log("useProfile: Returning data:", {
    formData: !!formData,
    loading,
    error,
    userId
  });

  return {
    formData,
    loading,
    error,
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
