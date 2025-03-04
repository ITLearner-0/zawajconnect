
import { useProfileData } from "./useProfileData";
import { useProfileForm } from "./useProfileForm";

export const useProfile = () => {
  const { 
    isNewUser, 
    userEmail, 
    formData: initialFormData, 
    verificationStatus: initialVerificationStatus 
  } = useProfileData();

  const {
    formData,
    verificationStatus,
    handleChange,
    handleVerificationChange,
    handleSubmit,
    handleSignOut,
  } = useProfileForm({
    initialFormData,
    initialVerificationStatus,
  });

  return {
    formData,
    isNewUser,
    userEmail,
    verificationStatus,
    handleChange,
    handleVerificationChange,
    handleSubmit,
    handleSignOut,
  };
};
