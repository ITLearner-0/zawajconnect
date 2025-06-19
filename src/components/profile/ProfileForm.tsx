import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import ProfileFormSections from './form/ProfileFormSections';
import ProfileFormActions from './form/ProfileFormActions';
import FormErrorBoundary from '@/components/ui/FormErrorBoundary';

interface ProfileFormProps {
  formData: ProfileFormData;
  handleChange: (field: string, value: any) => void;
  handleSubmit: () => Promise<boolean>;
  verificationStatus: VerificationStatus;
  userEmail: string | null;
  handleVerificationChange: (field: string, value: boolean) => void;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (field: string, value: any) => void;
  onToggleAccountVisibility: () => void;
  onUnblockUser: (userId: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  verificationStatus,
  userEmail,
  handleVerificationChange,
  privacySettings,
  blockedUsers,
  isAccountVisible,
  handlePrivacySettingsChange,
  onToggleAccountVisibility,
  onUnblockUser,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleFormSubmit = async () => {
    if (isSubmitting) return false;
    
    console.log("ProfileForm handleFormSubmit called");
    setIsSubmitting(true);
    
    try {
      const result = await handleSubmit();
      console.log("ProfileForm handleSubmit result:", result);
      return result;
    } catch (error) {
      console.error("ProfileForm handleSubmit error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormErrorBoundary>
      <div className="space-y-6">
        <ProfileFormSections
          formData={formData}
          handleChange={handleChange}
          verificationStatus={verificationStatus}
          userEmail={userEmail}
          handleVerificationChange={handleVerificationChange}
          privacySettings={privacySettings}
          blockedUsers={blockedUsers}
          isAccountVisible={isAccountVisible}
          handlePrivacySettingsChange={handlePrivacySettingsChange}
          onToggleAccountVisibility={onToggleAccountVisibility}
          onUnblockUser={onUnblockUser}
        />
        
        <ProfileFormActions 
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </FormErrorBoundary>
  );
};

export default ProfileForm;
