
import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import BasicInformation from './BasicInformation';
import EducationCareer from './EducationCareer';
import ReligiousBackground from './ReligiousBackground';
import AboutMe from './AboutMe';
import WaliInformation from './WaliInformation';
import VerificationPanel from './VerificationPanel';
import EnhancedPrivacySettings from './EnhancedPrivacySettings';
import ProfilePictureUpload from './ProfilePictureUpload';
import ProfileGallery from './ProfileGallery';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ProfileFormWithEnhancedPrivacyProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: () => Promise<boolean>;
  verificationStatus: VerificationStatus;
  userEmail: string | null;
  handleVerificationChange: (newStatus: VerificationStatus) => void;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (settings: PrivacySettings) => Promise<boolean>;
  onToggleAccountVisibility: () => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
  userId?: string;
}

const ProfileFormWithEnhancedPrivacy = ({
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
  userId
}: ProfileFormWithEnhancedPrivacyProps) => {
  const [profileImages, setProfileImages] = React.useState<string[]>([]);

  const handleProfilePictureUpdate = (imageUrl: string) => {
    // Update profile picture in form data
    console.log('Profile picture updated:', imageUrl);
  };

  const handleGalleryUpdate = (images: string[]) => {
    setProfileImages(images);
    console.log('Gallery updated:', images);
  };

  return (
    <div className="space-y-6">
      <form className="space-y-6">
        {/* Profile Picture and Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfilePictureUpload
            currentImage={formData.profilePicture}
            onImageUpdate={handleProfilePictureUpdate}
            isEditing={true}
          />
          <ProfileGallery
            images={profileImages}
            onImagesUpdate={handleGalleryUpdate}
            isEditing={true}
            maxImages={6}
          />
        </div>
        
        {/* Basic Information */}
        <BasicInformation formData={formData} handleChange={handleChange} />
        
        {/* Education & Career */}
        <EducationCareer formData={formData} handleChange={handleChange} />
        
        {/* Religious Background */}
        <ReligiousBackground formData={formData} handleChange={handleChange} />
        
        {/* About Me */}
        <AboutMe formData={formData} handleChange={handleChange} />
        
        {/* Wali Information */}
        <WaliInformation formData={formData} handleChange={handleChange} />
        
        {/* Verification Panel */}
        <VerificationPanel
          verificationStatus={verificationStatus}
          userEmail={userEmail}
          onVerificationChange={handleVerificationChange}
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

      {/* Enhanced Privacy Settings */}
      {userId && (
        <EnhancedPrivacySettings
          userId={userId}
          privacySettings={privacySettings}
          blockedUsers={blockedUsers}
          isAccountVisible={isAccountVisible}
          onPrivacyChange={handlePrivacySettingsChange}
          onToggleAccountVisibility={onToggleAccountVisibility}
          onUnblockUser={onUnblockUser}
        />
      )}
    </div>
  );
};

export default ProfileFormWithEnhancedPrivacy;
