

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileOnboarding from "@/components/profile/ProfileOnboarding";
import ProfileFormWithEnhancedPrivacy from "@/components/profile/ProfileFormWithEnhancedPrivacy";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasCompatibilityResults, setHasCompatibilityResults] = useState<boolean | null>(null);
  
  const { 
    formData, 
    isNewUser, 
    userEmail,
    userId,
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

  // Check if user has taken compatibility test
  useEffect(() => {
    const checkCompatibilityResults = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('compatibility_results')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (error) {
          console.error("Error checking compatibility results:", error);
          return;
        }

        setHasCompatibilityResults(data && data.length > 0);
      } catch (error) {
        console.error("Error checking compatibility results:", error);
      }
    };

    checkCompatibilityResults();
  }, [userId]);

  // Wrapper function to handle the save process and redirect to compatibility test
  const handleSaveProfile = async () => {
    console.log("Save profile button clicked");
    console.log("Données du formulaire avant sauvegarde:", formData);
    try {
      const success = await handleSubmit();
      console.log("Profile save result:", success);
      if (success) {
        console.log("Profile saved successfully");
        
        // Check if user has taken compatibility test
        if (hasCompatibilityResults === false) {
          toast({
            title: "Profile Saved Successfully!",
            description: "Now let's complete your compatibility test to find better matches.",
          });
          
          // Small delay to let the user see the success message
          setTimeout(() => {
            navigate("/compatibility");
          }, 1500);
        } else {
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          });
        }
      }
      return success;
    } catch (error) {
      console.error("Error saving profile:", error);
      return false;
    }
  };
  
  // Create a wrapper for handleChange to match the event-based signature
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    // Extract field and value from the event and call handleChange with correct signature
    const field = e.target.name;
    const value = e.target.value;
    handleChange(field, value);
  };

  // Create a wrapper for verification change to match expected signature
  const handleVerificationStatusChange = (newStatus: any) => {
    handleVerificationChange(newStatus);
  };

  // Create a wrapper for privacy settings change to match expected signature
  const handlePrivacyChange = async (newSettings: any) => {
    const success = await handlePrivacySettingsChange(newSettings);
    return success;
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-12" role="main" aria-labelledby="profile-heading">
        <div className="container max-w-3xl mx-auto px-4">
          <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
            <CardHeader>
              <ProfileHeader onSignOut={handleSignOut} />
              <p className="text-center text-rose-600 dark:text-rose-300">
                Keep your profile information up to date
              </p>
            </CardHeader>
            <CardContent>
              <ProfileFormWithEnhancedPrivacy
                formData={formData}
                handleChange={handleFormChange}
                handleSubmit={handleSaveProfile}
                verificationStatus={verificationStatus}
                userEmail={userEmail}
                handleVerificationChange={handleVerificationStatusChange}
                privacySettings={privacySettings}
                blockedUsers={blockedUsers}
                isAccountVisible={isAccountVisible}
                handlePrivacySettingsChange={handlePrivacyChange}
                onToggleAccountVisibility={handleToggleVisibility}
                onUnblockUser={handleUnblockUser}
                userId={userId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default Profile;
