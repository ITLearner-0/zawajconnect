
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomButton } from "@/components/CustomButton";
import { useNavigate } from "react-router-dom";
import BasicInformation from "@/components/profile/BasicInformation";
import EducationCareer from "@/components/profile/EducationCareer";
import ReligiousBackground from "@/components/profile/ReligiousBackground";
import AboutMe from "@/components/profile/AboutMe";
import WaliInformation from "@/components/profile/WaliInformation";
import VerificationPanel from "@/components/profile/VerificationPanel";
import PrivacySettings from "@/components/profile/PrivacySettings";
import { ProfileFormData, VerificationStatus, PrivacySettings as PrivacySettingsType } from "@/types/profile";

interface ProfileFormProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: () => void;
  verificationStatus: VerificationStatus;
  userEmail: string;
  handleVerificationChange: (newStatus: VerificationStatus) => void;
  privacySettings: PrivacySettingsType;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (settings: PrivacySettingsType) => void;
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
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }} 
        className="space-y-6"
        aria-label="Profile form"
      >
        <div role="region" aria-labelledby="basic-info-heading">
          <BasicInformation formData={formData} handleChange={handleChange} />
        </div>
        
        <div role="region" aria-labelledby="education-career-heading">
          <EducationCareer formData={formData} handleChange={handleChange} />
        </div>
        
        <div role="region" aria-labelledby="religious-background-heading">
          <ReligiousBackground formData={formData} handleChange={handleChange} />
        </div>
        
        <div role="region" aria-labelledby="about-me-heading">
          <AboutMe formData={formData} handleChange={handleChange} />
        </div>
        
        {formData.gender === "female" && (
          <div role="region" aria-labelledby="wali-heading">
            <WaliInformation 
              formData={formData} 
              handleChange={handleChange}
              showRequired={true} 
            />
          </div>
        )}
        
        {/* Verification Panel */}
        <div role="region" aria-labelledby="verification-heading">
          <VerificationPanel
            verificationStatus={verificationStatus}
            onVerificationChange={handleVerificationChange}
            userEmail={userEmail}
          />
        </div>
        
        {/* Privacy Settings */}
        <div role="region" aria-labelledby="privacy-heading">
          <PrivacySettings
            privacySettings={privacySettings}
            blockedUsers={blockedUsers}
            isAccountVisible={isAccountVisible}
            onPrivacyChange={handlePrivacySettingsChange}
            onToggleAccountVisibility={onToggleAccountVisibility}
            onUnblockUser={onUnblockUser}
          />
        </div>

        <div className="flex justify-between pt-6">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            aria-label="Back to home page"
          >
            Back
          </CustomButton>
          <CustomButton 
            type="submit"
            aria-label="Save your profile information"
          >
            Save Profile
          </CustomButton>
        </div>
      </form>
    </TooltipProvider>
  );
};

export default ProfileForm;
