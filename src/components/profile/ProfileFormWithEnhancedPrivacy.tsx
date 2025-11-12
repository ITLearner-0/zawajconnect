import React from 'react';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { PhotoBlurSettings as PhotoBlurSettingsType } from '@/types/documents';
import BasicInformation from './BasicInformation';
import EducationCareer from './EducationCareer';
import ReligiousBackground from './ReligiousBackground';
import AboutMe from './AboutMe';
import WaliInformation from './WaliInformation';
import VerificationPanel from './VerificationPanel';
import EnhancedPrivacySettings from './EnhancedPrivacySettings';
import PhotoBlurSettingsComponent from './PhotoBlurSettings';
import DocumentVerification from './DocumentVerification';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useDocumentVerification } from '@/hooks/useDocumentVerification';

interface ProfileFormWithEnhancedPrivacyProps {
  formData: ProfileFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: () => Promise<boolean>;
  verificationStatus: VerificationStatus;
  userEmail: string | null;
  handleVerificationChange: (field: keyof VerificationStatus, value: boolean) => void;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (settings: PrivacySettings) => Promise<boolean>;
  onToggleAccountVisibility: () => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
  userId?: string;
  photoBlurSettings?: PhotoBlurSettingsType;
  onPhotoBlurSettingsChange?: (settings: PhotoBlurSettingsType) => Promise<void>;
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
  userId,
  photoBlurSettings,
  onPhotoBlurSettingsChange,
}: ProfileFormWithEnhancedPrivacyProps) => {
  const { verifications, refetchVerifications } = useDocumentVerification(userId);

  const defaultPhotoBlurSettings: PhotoBlurSettingsType = {
    blur_profile_picture: false,
    blur_gallery_photos: false,
    blur_until_approved: false,
    blur_for_non_matches: true,
  };

  return (
    <div className="space-y-6">
      <form className="space-y-6">
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
            Save Profile
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

      {/* Photo Blur Settings */}
      {userId && onPhotoBlurSettingsChange && (
        <PhotoBlurSettingsComponent
          settings={photoBlurSettings || defaultPhotoBlurSettings}
          onChange={onPhotoBlurSettingsChange}
        />
      )}

      {/* Document Verification */}
      {userId && (
        <DocumentVerification
          userId={userId}
          verifications={verifications}
          onVerificationSubmitted={refetchVerifications}
        />
      )}
    </div>
  );
};

export default ProfileFormWithEnhancedPrivacy;
