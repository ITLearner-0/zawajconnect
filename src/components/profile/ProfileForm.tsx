
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
  
  // Convert field-based handler to React event handler for section components
  const handleSectionChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    console.log(`Form field change event: ${name} = ${value}`);
    
    // Validate the field based on its type
    let isValid = true;
    
    switch (name as keyof ProfileFormData) {
      case 'fullName':
        isValid = validateField(name as keyof ProfileFormData, value, (val) => 
          typeof val === 'string' && val.length >= 2 ? null : 'Name must be at least 2 characters'
        );
        break;
      case 'age':
        isValid = validateField(name as keyof ProfileFormData, value, (val) => {
          const age = parseInt(val as string);
          return (age >= 18 && age <= 100) ? null : 'Age must be between 18 and 100';
        });
        break;
      case 'gender':
        isValid = validateField(name as keyof ProfileFormData, value, (val) => 
          (val === 'male' || val === 'female') ? null : 'Please select a valid gender'
        );
        break;
      case 'aboutMe':
        isValid = validateField(name as keyof ProfileFormData, value, (val) => 
          typeof val === 'string' && val.length >= 10 ? null : 'Please write at least 10 characters about yourself'
        );
        break;
      default:
        // For other fields, just check they're not empty if required
        if (typeof value === 'string' && value.trim().length === 0) {
          isValid = validateField(name as keyof ProfileFormData, value, () => `${name} is required`);
        }
    }
    
    // Always call handleChange regardless of validation for real-time updates
    handleChange(name as keyof ProfileFormData, value);
  }, [handleChange, validateField]);

  // Handle select changes (for components that use onValueChange)
  const handleSelectChange = React.useCallback((field: keyof ProfileFormData, value: string) => {
    console.log(`Form select change: ${field} = ${value}`);
    handleChange(field, value);
  }, [handleChange]);
  
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
          handleChange={handleSectionChange}
          handleSelectChange={handleSelectChange}
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
