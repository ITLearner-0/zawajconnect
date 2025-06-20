
import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { StrictFormValidation } from '@/types/strictTypes';
import AboutSection from '../sections/AboutSection';
import BasicInfoSection from '../sections/BasicInfoSection';
import EducationSection from '../sections/EducationSection';
import ReligiousSection from '../sections/ReligiousSection';
import WaliSection from '../sections/WaliSection';
import VerificationPanel from '../VerificationPanel';
import PrivacySettingsComponent from '../PrivacySettings';

interface ProfileFormSectionsProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof ProfileFormData, value: string) => void;
  verificationStatus: VerificationStatus;
  userEmail: string | null;
  handleVerificationChange: (field: keyof VerificationStatus, value: boolean) => void;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (field: keyof PrivacySettings, value: any) => void;
  onToggleAccountVisibility: () => void;
  onUnblockUser: (userId: string) => void;
  validation: StrictFormValidation<ProfileFormData>;
}

const ProfileFormSections: React.FC<ProfileFormSectionsProps> = ({
  formData,
  handleChange,
  handleSelectChange,
  verificationStatus,
  userEmail,
  handleVerificationChange,
  privacySettings,
  blockedUsers,
  isAccountVisible,
  handlePrivacySettingsChange,
  onToggleAccountVisibility,
  onUnblockUser,
  validation,
}) => {
  // Convert the field-based verification handler to the expected format
  const handleVerificationStatusChange = (newStatus: VerificationStatus) => {
    // Compare new status with old and trigger changes for each field that changed
    Object.keys(newStatus).forEach(key => {
      const field = key as keyof VerificationStatus;
      if (newStatus[field] !== verificationStatus[field]) {
        handleVerificationChange(field, newStatus[field]);
      }
    });
  };

  return (
    <div className="space-y-8">
      <BasicInfoSection 
        formData={formData} 
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      
      <EducationSection 
        formData={formData} 
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      
      <ReligiousSection 
        formData={formData} 
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      
      <AboutSection 
        formData={formData} 
        handleChange={handleChange} 
      />
      
      <WaliSection 
        formData={formData} 
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      
      <VerificationPanel
        verificationStatus={verificationStatus}
        userEmail={userEmail}
        onVerificationChange={handleVerificationStatusChange}
      />
      
      <PrivacySettingsComponent
        privacySettings={privacySettings}
        blockedUsers={blockedUsers}
        isAccountVisible={isAccountVisible}
        onPrivacySettingsChange={handlePrivacySettingsChange}
        onToggleAccountVisibility={onToggleAccountVisibility}
        onUnblockUser={onUnblockUser}
      />
    </div>
  );
};

export default ProfileFormSections;
