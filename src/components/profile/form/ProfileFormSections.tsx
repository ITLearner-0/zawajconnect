
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import BasicInformationSection from '../sections/BasicInfoSection';
import AboutSection from '../sections/AboutSection';
import EducationSection from '../sections/EducationSection';
import ReligiousSection from '../sections/ReligiousSection';
import WaliSection from '../sections/WaliSection';
import VerificationPanel from '../VerificationPanel';
import EnhancedPrivacySettings from '../EnhancedPrivacySettings';
import ProfilePictureUpload from '../ProfilePictureUpload';
import ProfileGallery from '../ProfileGallery';
import ProfileFormHeader from './ProfileFormHeader';

interface ProfileFormSectionsProps {
  formData: ProfileFormData;
  handleChange: (field: string, value: any) => void;
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
}) => {
  const handleProfilePictureChange = (imageUrl: string | null) => {
    handleChange('profilePicture', imageUrl || '');
  };

  const handleGalleryChange = (gallery: string[]) => {
    handleChange('gallery', gallery);
  };

  // Create wrapper function for verification change to match expected signature
  const handleVerificationFieldChange = (newStatus: VerificationStatus) => {
    Object.entries(newStatus).forEach(([field, value]) => {
      if (verificationStatus[field as keyof VerificationStatus] !== value) {
        handleVerificationChange(field, value);
      }
    });
  };

  // Create wrapper function for privacy settings change to match expected signature
  const handlePrivacySettingsChangeWrapper = (newSettings: PrivacySettings) => {
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
        <ProfileFormHeader title="Photo de profil" />
        <CardContent>
          <ProfilePictureUpload
            currentPicture={formData.profilePicture}
            fullName={formData.fullName}
            onPictureChange={handleProfilePictureChange}
          />
        </CardContent>
      </Card>

      {/* Photo Gallery Section */}
      <Card>
        <ProfileFormHeader title="Galerie de photos" />
        <CardContent>
          <ProfileGallery
            gallery={formData.gallery || []}
            onGalleryChange={handleGalleryChange}
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <ProfileFormHeader title="Informations de base" />
        <CardContent className="space-y-4">
          <BasicInformationSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* About Me */}
      <Card>
        <ProfileFormHeader title="À propos de moi" />
        <CardContent>
          <AboutSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <ProfileFormHeader title="Éducation et carrière" />
        <CardContent className="space-y-4">
          <EducationSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* Religious Background */}
      <Card>
        <ProfileFormHeader title="Contexte religieux" />
        <CardContent className="space-y-4">
          <ReligiousSection formData={formData} handleChange={handleChange} />
        </CardContent>
      </Card>

      {/* Wali Information */}
      {formData.gender === 'female' && (
        <Card>
          <ProfileFormHeader title="Informations du Wali" />
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

      {/* Privacy Settings - Only show if userEmail exists and can be used as userId */}
      {userEmail && (
        <EnhancedPrivacySettings
          userId={userEmail}
          privacySettings={privacySettings}
          blockedUsers={blockedUsers}
          isAccountVisible={isAccountVisible}
          onPrivacyChange={handlePrivacySettingsChangeWrapper}
          onToggleAccountVisibility={handleToggleAccountVisibilityAsync}
          onUnblockUser={handleUnblockUserAsync}
        />
      )}
    </div>
  );
};

export default ProfileFormSections;
