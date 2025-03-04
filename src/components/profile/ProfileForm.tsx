
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CustomButton from "@/components/CustomButton";
import { useNavigate } from "react-router-dom";
import BasicInformation from "@/components/profile/BasicInformation";
import EducationCareer from "@/components/profile/EducationCareer";
import ReligiousBackground from "@/components/profile/ReligiousBackground";
import AboutMe from "@/components/profile/AboutMe";
import WaliInformation from "@/components/profile/WaliInformation";
import VerificationPanel from "@/components/profile/VerificationPanel";
import PrivacySettings from "@/components/profile/PrivacySettings";
import { ProfileFormData, VerificationStatus, PrivacySettings as PrivacySettingsType } from "@/types/profile";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Save, ArrowLeft, User, Briefcase, BookOpen, Heart, Shield, LockKeyhole } from "lucide-react";

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
        className="space-y-8"
        aria-label="Profile form"
      >
        <div role="region" aria-labelledby="basic-info-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <User className="h-5 w-5 mr-2 text-islamic-teal" />
              <h2 id="basic-info-heading" className="text-xl font-medium text-islamic-teal">Basic Information</h2>
            </div>
            <div className="p-6">
              <BasicInformation formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        <div role="region" aria-labelledby="education-career-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <Briefcase className="h-5 w-5 mr-2 text-islamic-teal" />
              <h2 id="education-career-heading" className="text-xl font-medium text-islamic-teal">Education & Career</h2>
            </div>
            <div className="p-6">
              <EducationCareer formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        <div role="region" aria-labelledby="religious-background-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <BookOpen className="h-5 w-5 mr-2 text-islamic-teal" />
              <h2 id="religious-background-heading" className="text-xl font-medium text-islamic-teal">Religious Background</h2>
            </div>
            <div className="p-6">
              <ReligiousBackground formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        <div role="region" aria-labelledby="about-me-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <Heart className="h-5 w-5 mr-2 text-islamic-teal" />
              <h2 id="about-me-heading" className="text-xl font-medium text-islamic-teal">About Me</h2>
            </div>
            <div className="p-6">
              <AboutMe formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        {formData.gender === "female" && (
          <div role="region" aria-labelledby="wali-heading">
            <IslamicPattern variant="card" color="gold" className="overflow-hidden">
              <div className="bg-islamic-gold/10 p-4 flex items-center border-b border-islamic-gold/10">
                <Shield className="h-5 w-5 mr-2 text-islamic-gold" />
                <h2 id="wali-heading" className="text-xl font-medium text-islamic-burgundy">Wali Information</h2>
              </div>
              <div className="p-6">
                <WaliInformation 
                  formData={formData} 
                  handleChange={handleChange}
                  showRequired={true} 
                />
              </div>
            </IslamicPattern>
          </div>
        )}
        
        {/* Verification Panel */}
        <div role="region" aria-labelledby="verification-heading">
          <IslamicPattern variant="card" color="gold" className="overflow-hidden">
            <div className="bg-islamic-gold/10 p-4 flex items-center border-b border-islamic-gold/10">
              <Shield className="h-5 w-5 mr-2 text-islamic-gold" />
              <h2 id="verification-heading" className="text-xl font-medium text-islamic-burgundy">Verification</h2>
            </div>
            <div className="p-6">
              <VerificationPanel
                verificationStatus={verificationStatus}
                onVerificationChange={handleVerificationChange}
                userEmail={userEmail}
              />
            </div>
          </IslamicPattern>
        </div>
        
        {/* Privacy Settings */}
        <div role="region" aria-labelledby="privacy-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <LockKeyhole className="h-5 w-5 mr-2 text-islamic-teal" />
              <h2 id="privacy-heading" className="text-xl font-medium text-islamic-teal">Privacy Settings</h2>
            </div>
            <div className="p-6">
              <PrivacySettings
                privacySettings={privacySettings}
                blockedUsers={blockedUsers}
                isAccountVisible={isAccountVisible}
                onPrivacyChange={handlePrivacySettingsChange}
                onToggleAccountVisibility={onToggleAccountVisibility}
                onUnblockUser={onUnblockUser}
              />
            </div>
          </IslamicPattern>
        </div>

        <div className="flex justify-between pt-6">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            aria-label="Back to home page"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </CustomButton>
          <CustomButton 
            type="submit"
            variant="teal"
            aria-label="Save your profile information"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Profile
          </CustomButton>
        </div>
      </form>
    </TooltipProvider>
  );
};

export default ProfileForm;
