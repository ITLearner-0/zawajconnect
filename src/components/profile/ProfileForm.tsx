
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import BasicInformationSection from './sections/BasicInfoSection';
import AboutSection from './sections/AboutSection';
import EducationSection from './sections/EducationSection';
import ReligiousSection from './sections/ReligiousSection';
import WaliSection from './sections/WaliSection';
import VerificationPanel from './VerificationPanel';
import EnhancedPrivacySettings from './EnhancedPrivacySettings';
import ProfilePictureUpload from './ProfilePictureUpload';

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
  const handleProfilePictureChange = (imageUrl: string | null) => {
    handleChange('profilePicture', imageUrl || '');
  };

  // Create wrapper function for verification change to match expected signature
  const handleVerificationFieldChange = (newStatus: VerificationStatus) => {
    // Convert the new status object back to individual field calls
    Object.entries(newStatus).forEach(([field, value]) => {
      if (verificationStatus[field as keyof VerificationStatus] !== value) {
        handleVerificationChange(field, value);
      }
    });
  };

  // Create wrapper function for privacy settings change to match expected signature
  const handlePrivacySettingsChangeWrapper = (newSettings: PrivacySettings) => {
    // Convert the settings object to individual field calls
    Object.entries(newSettings).forEach(([field, value]) => {
      if (privacySettings[field as keyof PrivacySettings] !== value) {
        handlePrivacySettingsChange(field, value);
      }
    });
  };

  // Create wrapper functions to return promises
  const handleToggleAccountVisibilityAsync = async () => {
    onToggleAccountVisibility();
  };

  const handleUnblockUserAsync = async (userId: string) => {
    onUnblockUser(userId);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-200">Photo de profil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload
            currentPicture={formData.profilePicture}
            fullName={formData.fullName}
            onPictureChange={handleProfilePictureChange}
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-200">Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BasicInformationSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* About Me */}
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-200">À propos de moi</CardTitle>
        </CardHeader>
        <CardContent>
          <AboutSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-200">Éducation et carrière</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EducationSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* Religious Background */}
      <Card>
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-200">Contexte religieux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReligiousSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* Wali Information */}
      {formData.gender === 'female' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-rose-800 dark:text-rose-200">Informations du Wali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WaliSection formData={formData} handleChange={handleChange} />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Verification Panel */}
      <VerificationPanel
        verificationStatus={verificationStatus}
        userEmail={userEmail || ''}
        onVerificationChange={handleVerificationFieldChange}
      />

      <Separator />

      {/* Privacy Settings */}
      <EnhancedPrivacySettings
        userId={userEmail || ''}
        privacySettings={privacySettings}
        blockedUsers={blockedUsers}
        isAccountVisible={isAccountVisible}
        onPrivacyChange={handlePrivacySettingsChangeWrapper}
        onToggleAccountVisibility={handleToggleAccountVisibilityAsync}
        onUnblockUser={handleUnblockUserAsync}
      />

      <div className="flex justify-center pt-6">
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white px-8"
        >
          Sauvegarder le profil
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
