
import { ProfileFormData, VerificationStatus, PrivacySettings } from "@/types/profile";
import { useProfileFormState } from "./useProfileFormState";
import { useProfileVerification } from "./useProfileVerification";
import { usePrivacyManagement } from "./usePrivacyManagement";
import { useAccountVisibility } from "./useAccountVisibility";
import { useBlockedUsers } from "./useBlockedUsers";
import { useProfileSubmission } from "./useProfileSubmission";
import { useAuthSignOut } from "./useAuthSignOut";
import { useEffect } from "react";

interface UseProfileFormProps {
  initialFormData: ProfileFormData | null;
  initialVerificationStatus: VerificationStatus;
  initialPrivacySettings?: PrivacySettings | null;
  initialBlockedUsers?: string[];
  initialIsVisible?: boolean;
  userId: string | null;
}

// Default privacy settings to use when none are available
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1,
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true
};

export const useProfileForm = ({ 
  initialFormData, 
  initialVerificationStatus,
  initialPrivacySettings,
  initialBlockedUsers,
  initialIsVisible,
  userId
}: UseProfileFormProps) => {
  // Form state management
  const { formData, handleChange, setFormData } = useProfileFormState({
    initialFormData: initialFormData || {
      fullName: '',
      age: '',
      gender: '',
      location: '',
      education: '',
      occupation: '',
      religiousLevel: '',
      familyBackground: '',
      aboutMe: '',
      prayerFrequency: '',
      waliName: '',
      waliRelationship: '',
      waliContact: '',
      gallery: []
    }
  });

  // Update form data when initial data changes (after fetching from DB)
  useEffect(() => {
    if (initialFormData && JSON.stringify(initialFormData) !== JSON.stringify(formData)) {
      console.log("Updating form data with initial data:", initialFormData);
      setFormData(initialFormData);
    }
  }, [initialFormData, setFormData]);

  // Verification status
  const { verificationStatus, handleVerificationChange } = useProfileVerification({
    initialVerificationStatus
  });
  
  // Privacy settings - initialize with default values if null
  const { privacySettings, handlePrivacySettingsChange } = usePrivacyManagement({
    userId: userId || undefined,
    initialPrivacySettings: initialPrivacySettings || DEFAULT_PRIVACY_SETTINGS
  });

  // Account visibility
  const { isAccountVisible, toggleAccountVisibility } = useAccountVisibility({
    initialIsVisible
  });

  // Blocked users
  const blockedUsersData = useBlockedUsers(userId);
  
  useEffect(() => {
    if (userId) {
      blockedUsersData.fetchBlockedUsers();
    }
  }, [userId]);

  // Profile submission
  const { submitProfile } = useProfileSubmission();
  
  const handleSubmit = async () => {
    if (!userId) {
      console.error("No user ID available");
      return false;
    }
    
    console.log("handleSubmit called with:", {
      userId,
      formData,
      privacySettings: privacySettings || DEFAULT_PRIVACY_SETTINGS
    });
    
    const success = await submitProfile(
      userId, 
      formData, 
      privacySettings || DEFAULT_PRIVACY_SETTINGS,
      (savedData) => {
        // Update form data with the saved data to retain the information
        console.log("Profile saved, updating form data:", savedData);
        setFormData(savedData);
      }
    );
    
    console.log("submitProfile returned:", success);
    return success;
  };

  // Auth sign out
  const { handleSignOut } = useAuthSignOut();

  return {
    formData,
    verificationStatus,
    privacySettings: privacySettings || DEFAULT_PRIVACY_SETTINGS,
    blockedUsers: blockedUsersData.blockedUsers,
    isAccountVisible,
    handleChange,
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSubmit,
    handleSignOut,
    toggleAccountVisibility,
    unblockUser: blockedUsersData.unblockUser,
  };
};
