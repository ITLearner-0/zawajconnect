import React, { useState } from "react";
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
import { Save, ArrowLeft, User, Briefcase, BookOpen, Heart, Shield, LockKeyhole, CheckCircle } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      await handleSubmit();
      setSubmitSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <form 
        onSubmit={handleFormSubmit}
        className="space-y-8"
        aria-label="Profile form"
      >
        
        <div role="region" aria-labelledby="basic-info-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <User className="h-5 w-5 mr-2 text-islamic-teal dark:text-islamic-brightGold" />
              <h2 id="basic-info-heading" className="text-xl font-medium text-islamic-teal dark:text-islamic-cream">Basic Information</h2>
            </div>
            <div className="p-6">
              <BasicInformation formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        <div role="region" aria-labelledby="education-career-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <Briefcase className="h-5 w-5 mr-2 text-islamic-teal dark:text-islamic-brightGold" />
              <h2 id="education-career-heading" className="text-xl font-medium text-islamic-teal dark:text-islamic-cream">Education & Career</h2>
            </div>
            <div className="p-6">
              <EducationCareer formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        <div role="region" aria-labelledby="religious-background-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <BookOpen className="h-5 w-5 mr-2 text-islamic-teal dark:text-islamic-brightGold" />
              <h2 id="religious-background-heading" className="text-xl font-medium text-islamic-teal dark:text-islamic-cream">Religious Background</h2>
            </div>
            <div className="p-6">
              <ReligiousBackground formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        <div role="region" aria-labelledby="about-me-heading">
          <IslamicPattern variant="card" color="teal" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <Heart className="h-5 w-5 mr-2 text-islamic-teal dark:text-islamic-brightGold" />
              <h2 id="about-me-heading" className="text-xl font-medium text-islamic-teal dark:text-islamic-cream">About Me</h2>
            </div>
            <div className="p-6">
              <AboutMe formData={formData} handleChange={handleChange} />
            </div>
          </IslamicPattern>
        </div>
        
        {formData.gender === "female" && (
          <div role="region" aria-labelledby="wali-heading">
            <IslamicPattern variant="card" color="gold" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
              <div className="bg-islamic-brightGold/20 p-4 flex items-center border-b border-islamic-brightGold/10">
                <Shield className="h-5 w-5 mr-2 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <h2 id="wali-heading" className="text-xl font-medium text-islamic-burgundy dark:text-islamic-cream">Wali Information</h2>
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
          <IslamicPattern variant="card" color="gold" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
            <div className="bg-islamic-brightGold/20 p-4 flex items-center border-b border-islamic-brightGold/10">
              <Shield className="h-5 w-5 mr-2 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
              <h2 id="verification-heading" className="text-xl font-medium text-islamic-burgundy dark:text-islamic-cream">Verification</h2>
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
          <IslamicPattern variant="card" color="teal" className="overflow-hidden bg-white dark:bg-islamic-darkCard">
            <div className="bg-islamic-teal/10 p-4 flex items-center border-b border-islamic-teal/10">
              <LockKeyhole className="h-5 w-5 mr-2 text-islamic-teal dark:text-islamic-brightGold" />
              <h2 id="privacy-heading" className="text-xl font-medium text-islamic-teal dark:text-islamic-cream">Privacy Settings</h2>
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
            className="flex items-center gap-2 border-islamic-teal/30 hover:bg-islamic-teal/5 dark:border-islamic-darkTeal/40 dark:hover:bg-islamic-darkTeal/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </CustomButton>
          <CustomButton 
            type="submit"
            variant={submitSuccess ? "default" : "gold"}
            disabled={isSubmitting}
            aria-label="Save your profile information"
            className={`flex items-center gap-2 transition-all duration-300 ${
              submitSuccess 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </CustomButton>
        </div>
      </form>
    </TooltipProvider>
  );
};

export default ProfileForm;
