
import { ProfileFormData, VerificationStatus, PrivacySettings } from "@/types/profile";
import { useProfileFormState } from "./profile/useProfileFormState";
import { useProfileVerification } from "./profile/useProfileVerification";
import { usePrivacyManagement } from "./profile/usePrivacyManagement";
import { useAccountVisibility } from "./profile/useAccountVisibility";
import { useBlockedUsers } from "./profile/useBlockedUsers";
import { useProfileSubmission } from "./profile/useProfileSubmission";
import { useAuthSignOut } from "./profile/useAuthSignOut";

interface UseProfileFormProps {
  initialFormData: ProfileFormData;
  initialVerificationStatus: VerificationStatus;
  initialPrivacySettings?: PrivacySettings;
  initialBlockedUsers?: string[];
  initialIsVisible?: boolean;
}

export const useProfileForm = ({ 
  initialFormData, 
  initialVerificationStatus,
  initialPrivacySettings,
  initialBlockedUsers,
  initialIsVisible
}: UseProfileFormProps) => {
  // Form state management
  const { formData, handleChange } = useProfileFormState({
    initialFormData
  });

  // Verification status
  const { verificationStatus, handleVerificationChange } = useProfileVerification({
    initialVerificationStatus
  });
  
  // Privacy settings
  const { privacySettings, handlePrivacySettingsChange } = usePrivacyManagement({
    initialPrivacySettings
  });

  // Account visibility
  const { isAccountVisible, toggleAccountVisibility } = useAccountVisibility({
    initialIsVisible
  });

  // Blocked users
  const { blockedUsers, unblockUser } = useBlockedUsers({
    initialBlockedUsers
  });

  // Profile submission
  const { handleSubmit } = useProfileSubmission({
    formData,
    privacySettings,
    blockedUsers,
    isAccountVisible
  });

  // Auth sign out
  const { handleSignOut } = useAuthSignOut();

  // Wrapper for toggleAccountVisibility to make it work with the current interface
  const handleToggleAccountVisibility = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    return toggleAccountVisibility(session.user.id);
  };

  // Wrapper for unblockUser to make it work with the current interface
  const handleUnblockUser = async (userIdToUnblock: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    return unblockUser(session.user.id, userIdToUnblock);
  };

  return {
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
    toggleAccountVisibility: handleToggleAccountVisibility,
    unblockUser: handleUnblockUser,
  };
};

// Missing import - adding it here
import { supabase } from "@/integrations/supabase/client";
