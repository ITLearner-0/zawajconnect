
import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { StrictFormValidation } from '@/types/strictTypes';
import { useTypeValidation } from '@/hooks/validation/useTypeValidation';
import ProfileFormSections from './form/ProfileFormSections';
import ProfileFormActions from './form/ProfileFormActions';
import FormErrorBoundary from '@/components/ui/FormErrorBoundary';

interface ProfileFormProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
  handleSubmit: () => Promise<boolean>;
  verificationStatus: VerificationStatus;
  userEmail: string | null;
  handleVerificationChange: (field: keyof VerificationStatus, value: boolean) => void;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (field: keyof PrivacySettings, value: any) => void;
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
  const { validation, validateField, hasErrors } = useTypeValidation<ProfileFormData>();
  
  // Type-safe field change handler
  const handleTypedChange = React.useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    // Validate the field based on its type
    let isValid = true;
    
    switch (field) {
      case 'fullName':
        isValid = validateField(field, value, (val) => 
          typeof val === 'string' && val.length >= 2 ? null : 'Name must be at least 2 characters'
        );
        break;
      case 'age':
        isValid = validateField(field, value, (val) => {
          const age = parseInt(val as string);
          return (age >= 18 && age <= 100) ? null : 'Age must be between 18 and 100';
        });
        break;
      case 'gender':
        isValid = validateField(field, value, (val) => 
          (val === 'male' || val === 'female') ? null : 'Please select a valid gender'
        );
        break;
      case 'aboutMe':
        isValid = validateField(field, value, (val) => 
          typeof val === 'string' && val.length >= 10 ? null : 'Please write at least 10 characters about yourself'
        );
        break;
      default:
        // For other fields, just check they're not empty if required
        if (typeof value === 'string' && value.trim().length === 0) {
          isValid = validateField(field, value, () => `${String(field)} is required`);
        }
    }
    
    if (isValid) {
      handleChange(field, value);
    }
  }, [handleChange, validateField]);
  
  const handleFormSubmit = async (): Promise<boolean> => {
    if (isSubmitting || hasErrors) return false;
    
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
          handleChange={handleTypedChange}
          verificationStatus={verificationStatus}
          userEmail={userEmail}
          handleVerificationChange={handleVerificationChange}
          privacySettings={privacySettings}
          blockedUsers={blockedUsers}
          isAccountVisible={isAccountVisible}
          handlePrivacySettingsChange={handlePrivacySettingsChange}
          onToggleAccountVisibility={onToggleAccountVisibility}
          onUnblockUser={onUnblockUser}
          validation={validation}
        />
        
        <ProfileFormActions 
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          hasErrors={hasErrors}
        />
      </div>
    </FormErrorBoundary>
  );
};

export default ProfileForm;
