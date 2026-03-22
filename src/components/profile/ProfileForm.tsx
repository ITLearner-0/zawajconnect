import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { StrictFormValidation } from '@/types/strictTypes';
import { useTypeValidation } from '@/hooks/validation/useTypeValidation';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { useToast } from '@/hooks/use-toast';
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
  const { checkRateLimit } = useRateLimiting();
  const { toast } = useToast();

  // Convert field-based handler to React event handler for section components
  const handleSectionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      console.log(`Form field change event: ${name} = ${value}`);

      // Optional validation - don't block form submission
      switch (name as keyof ProfileFormData) {
        case 'fullName':
          if (value && typeof value === 'string' && value.length >= 2) {
            validateField(name as keyof ProfileFormData, value, () => null);
          }
          break;
        case 'age':
          if (value) {
            const age = parseInt(value as string);
            if (age >= 18 && age <= 100) {
              validateField(name as keyof ProfileFormData, value, () => null);
            }
          }
          break;
        case 'aboutMe':
          if (value && typeof value === 'string' && value.length >= 50) {
            validateField(name as keyof ProfileFormData, value, () => null);
          }
          break;
        default:
          // No validation required for other fields
          break;
      }

      // Always call handleChange regardless of validation
      handleChange(name as keyof ProfileFormData, value);
    },
    [handleChange, validateField]
  );

  // Handle select changes (for components that use onValueChange)
  const handleSelectChange = React.useCallback(
    (field: keyof ProfileFormData, value: string) => {
      console.log(`Form select change: ${field} = ${value}`);
      handleChange(field, value);
    },
    [handleChange]
  );

  const handleFormSubmit = async (): Promise<boolean> => {
    if (isSubmitting) return false;

    console.log('ProfileForm handleFormSubmit called');

    // Check rate limiting for profile updates
    const rateLimitAllowed = await checkRateLimit('api/profile');
    if (!rateLimitAllowed) {
      toast({
        title: 'Rate Limit Exceeded',
        description: 'Too many profile updates. Please wait before trying again.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const result = await handleSubmit();
      console.log('ProfileForm handleSubmit result:', result);
      return result;
    } catch (error) {
      console.error('ProfileForm handleSubmit error:', error);
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
          hasErrors={false}
        />
      </div>
    </FormErrorBoundary>
  );
};

export default ProfileForm;
