
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileOnboarding from "@/components/profile/ProfileOnboarding";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { 
    formData, 
    isNewUser, 
    userEmail,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    handleChange, 
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSubmit, 
    handleSignOut,
    toggleAccountVisibility,
    unblockUser
  } = useProfile();
  
  const {
    isOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep
  } = useOnboarding(formData, isNewUser);

  // Wrapper function to handle the save process with loading state
  const handleSaveProfile = async () => {
    setIsSaving(true);
    console.log("Save profile button clicked");
    try {
      const success = await handleSubmit();
      console.log("Profile save result:", success);
      if (success) {
        console.log("Profile saved successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Wrapper functions to convert boolean returns to void
  const handleToggleVisibility = async () => {
    await toggleAccountVisibility();
  };
  
  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
  };

  if (isOnboarding) {
    return (
      <AccessibilityProvider>
        <ProfileOnboarding
          isOnboarding={isOnboarding}
          currentStep={currentStep}
          steps={steps}
          formData={formData}
          handleChange={handleChange}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          completeOnboarding={completeOnboarding}
          canProceedCurrentStep={canProceedCurrentStep}
        />
      </AccessibilityProvider>
    );
  }

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-islamic-solidGreen dark:bg-islamic-darkGreen py-12" role="main" aria-labelledby="profile-heading">
        <div className="container max-w-3xl mx-auto px-4">
          <Card className="shadow-lg border-islamic-teal/10 dark:border-islamic-darkTeal/20">
            <CardHeader>
              <ProfileHeader onSignOut={handleSignOut} />
              <p className="text-center text-islamic-burgundy/80 dark:text-islamic-cream/80">
                Keep your profile information up to date
              </p>
            </CardHeader>
            <CardContent>
              {isSaving && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2 dark:bg-islamic-darkCard">
                    <Loader2 className="h-5 w-5 animate-spin text-islamic-teal dark:text-islamic-brightGold" />
                    <span className="dark:text-islamic-cream">Saving profile...</span>
                  </div>
                </div>
              )}
              <ProfileForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSaveProfile}
                verificationStatus={verificationStatus}
                userEmail={userEmail}
                handleVerificationChange={handleVerificationChange}
                privacySettings={privacySettings}
                blockedUsers={blockedUsers}
                isAccountVisible={isAccountVisible}
                handlePrivacySettingsChange={handlePrivacySettingsChange}
                onToggleAccountVisibility={handleToggleVisibility}
                onUnblockUser={handleUnblockUser}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default Profile;
