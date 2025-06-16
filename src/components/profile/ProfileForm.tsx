
import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import BasicInformation from './BasicInformation';
import EducationCareer from './EducationCareer';
import ReligiousBackground from './ReligiousBackground';
import AboutMe from './AboutMe';
import WaliInformation from './WaliInformation';
import VerificationPanel from './VerificationPanel';
import EnhancedPrivacySettings from './EnhancedPrivacySettings';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

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
  onToggleAccountVisibility: () => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
}

const ProfileForm = ({
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
  onUnblockUser
}: ProfileFormProps) => {
  console.log("ProfileForm rendered with privacySettings:", privacySettings);
  
  // Convert handleChange to event-based signature for form components
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  // Convert verification change to match expected signature
  const handleVerificationFieldChange = (newStatus: VerificationStatus) => {
    Object.entries(newStatus).forEach(([field, value]) => {
      if (verificationStatus[field as keyof VerificationStatus] !== value) {
        handleVerificationChange(field, value);
      }
    });
  };

  // Convert privacy settings change
  const handlePrivacyChange = (settings: PrivacySettings) => {
    Object.entries(settings).forEach(([field, value]) => {
      if (privacySettings[field as keyof PrivacySettings] !== value) {
        handlePrivacySettingsChange(field, value);
      }
    });
    return Promise.resolve(true);
  };

  return (
    <div className="space-y-6">
      <form className="space-y-6">
        {/* Basic Information */}
        <BasicInformation formData={formData} handleChange={handleFieldChange} />
        
        {/* Education & Career */}
        <EducationCareer formData={formData} handleChange={handleFieldChange} />
        
        {/* Religious Background */}
        <ReligiousBackground formData={formData} handleChange={handleFieldChange} />
        
        {/* About Me */}
        <AboutMe formData={formData} handleChange={handleFieldChange} />
        
        {/* Wali Information */}
        <WaliInformation formData={formData} handleChange={handleFieldChange} />
        
        {/* Verification Panel */}
        <VerificationPanel
          verificationStatus={verificationStatus}
          userEmail={userEmail}
          onVerificationChange={handleVerificationFieldChange}
        />

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-8 py-2"
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder le Profil
          </Button>
        </div>
      </form>

      {/* Enhanced Privacy Settings - always show with current user ID */}
      <EnhancedPrivacySettings
        userId="current-user" // This will be replaced by the actual userId from the parent
        privacySettings={privacySettings}
        blockedUsers={blockedUsers}
        isAccountVisible={isAccountVisible}
        onPrivacyChange={handlePrivacyChange}
        onToggleAccountVisibility={onToggleAccountVisibility}
        onUnblockUser={onUnblockUser}
      />
    </div>
  );
};

export default ProfileForm;
