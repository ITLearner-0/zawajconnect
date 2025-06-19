
import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { StrictFormValidation } from '@/types/strictTypes';
import AboutSection from '../sections/AboutSection';
import BasicInfoSection from '../sections/BasicInfoSection';
import EducationSection from '../sections/EducationSection';
import ReligiousSection from '../sections/ReligiousSection';
import WaliSection from '../sections/WaliSection';
import VerificationPanel from '../VerificationPanel';
import PrivacySettings from '../PrivacySettings';

interface ProfileFormSectionsProps {
  formData: ProfileFormData;
  handleChange: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
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
  return (
    <>
      <BasicInfoSection 
        formData={formData} 
        handleChange={handleChange} 
        validation={validation}
      />
      
      <EducationSection 
        formData={formData} 
        handleChange={handleChange} 
        validation={validation}
      />
      
      <ReligiousSection 
        formData={formData} 
        handleChange={handleChange} 
        validation={validation}
      />
      
      <AboutSection 
        formData={formData} 
        handleChange={handleChange} 
        validation={validation}
      />
      
      <WaliSection 
        formData={formData} 
        handleChange={handleChange} 
        validation={validation}
      />
      
      <VerificationPanel
        verificationStatus={verificationStatus}
        userEmail={userEmail}
        onVerificationChange={handleVerificationChange}
      />
      
      <PrivacySettings
        privacySettings={privacySettings}
        blockedUsers={blockedUsers}
        isAccountVisible={isAccountVisible}
        onPrivacySettingsChange={handlePrivacySettingsChange}
        onToggleAccountVisibility={onToggleAccountVisibility}
        onUnblockUser={onUnblockUser}
      />
    </>
  );
};

export default ProfileFormSections;
