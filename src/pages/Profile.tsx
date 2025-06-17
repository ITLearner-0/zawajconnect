
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileOnboarding from "@/components/profile/ProfileOnboarding";
import ProfileAnalytics from "@/components/profile/ProfileAnalytics";
import ProfileRecommendations from "@/components/profile/ProfileRecommendations";
import ProfileVisibilityManager from "@/components/profile/ProfileVisibilityManager";
import { useProfileAnalytics } from "@/hooks/profile/useProfileAnalytics";
import { useProfileRecommendations } from "@/hooks/profile/useProfileRecommendations";

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

  // Analytics and recommendations - use userId instead of userEmail
  const { analytics, loading: analyticsLoading } = useProfileAnalytics(userId);
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    handleRecommendationAction 
  } = useProfileRecommendations(userId);
  
  const {
    isOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep
  } = useOnboarding(formData, isNewUser);

  // Visibility settings state
  const [visibilitySettings, setVisibilitySettings] = useState({
    isVisible: isAccountVisible,
    visibilityLevel: 80,
    showOnlyToMatches: false,
    hideFromSearch: false,
    temporaryHide: false,
    temporaryHideUntil: undefined
  });

  // Check if user has taken compatibility test
  useEffect(() => {
    const checkCompatibilityResults = async () => {
      if (!userId) return;
      
      try {
        console.log("Checking compatibility results for user:", userId);
        const { data, error } = await supabase
          .from('compatibility_results')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (error) {
          console.error("Error checking compatibility results:", error);
          setHasCompatibilityResults(false);
          return;
        }

        const hasResults = data && data.length > 0;
        console.log("User has compatibility results:", hasResults);
        setHasCompatibilityResults(hasResults);
      } catch (error) {
        console.error("Error checking compatibility results:", error);
        setHasCompatibilityResults(false);
      }
    };

    checkCompatibilityResults();
  }, [userId]);

  // Wrapper function to handle the save process and redirect
  const handleSaveProfile = async () => {
    console.log("Save profile button clicked");
    console.log("User ID:", userId);
    console.log("Has compatibility results:", hasCompatibilityResults);
    
    try {
      const success = await handleSubmit();
      console.log("Profile save result:", success);
      
      if (success) {
        console.log("Profile saved successfully");
        
        // Check if user has taken compatibility test
        if (hasCompatibilityResults === false) {
          toast({
            title: "Profil Sauvegardé!",
            description: "Maintenant, complétez votre test de compatibilité pour trouver de meilleurs matches.",
          });
          
          // Small delay to let the user see the success message
          setTimeout(() => {
            console.log("Redirecting to compatibility test");
            navigate("/compatibility");
          }, 2000);
        } else {
          toast({
            title: "Profil Mis à Jour",
            description: "Votre profil a été mis à jour avec succès.",
          });
          
          // If user has already taken the test, redirect to nearby matches
          setTimeout(() => {
            console.log("Redirecting to nearby matches");
            navigate("/nearby");
          }, 2000);
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Create a wrapper for handleChange to match expected signature
  const handleFieldChange = (field: string, value: any) => {
    // Convert to the event-based signature that handleChange expects
    const event = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(event);
  };

  // Create a wrapper for verification change to match expected signature
  const handleVerificationFieldChange = (field: string, value: boolean) => {
    const newStatus = { ...verificationStatus, [field]: value };
    handleVerificationChange(newStatus);
  };

  // Create a wrapper for privacy settings change
  const handlePrivacyFieldChange = (field: string, value: any) => {
    const newSettings = { ...privacySettings, [field]: value };
    handlePrivacySettingsChange(newSettings);
  };
  
  // Wrapper functions to convert boolean returns to void
  const handleToggleVisibility = async () => {
    await toggleAccountVisibility();
  };
  
  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
  };

  const handleVisibilitySettingsChange = (newSettings: any) => {
    setVisibilitySettings(newSettings);
    // Here you could also sync with backend if needed
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
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
            <CardHeader>
              <ProfileHeader onSignOut={handleSignOut} />
              <p className="text-center text-rose-600 dark:text-rose-300">
                Manage your profile and privacy settings
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="recommendations">Tips</TabsTrigger>
                  <TabsTrigger value="visibility">Visibility</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <ProfileForm
                    formData={formData}
                    handleChange={handleFieldChange}
                    handleSubmit={handleSaveProfile}
                    verificationStatus={verificationStatus}
                    userEmail={userEmail}
                    handleVerificationChange={handleVerificationFieldChange}
                    privacySettings={privacySettings}
                    blockedUsers={blockedUsers}
                    isAccountVisible={isAccountVisible}
                    handlePrivacySettingsChange={handlePrivacyFieldChange}
                    onToggleAccountVisibility={handleToggleVisibility}
                    onUnblockUser={handleUnblockUser}
                  />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-t-2 border-rose-600 rounded-full"></div>
                    </div>
                  ) : (
                    <ProfileAnalytics analytics={analytics} />
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="mt-6">
                  {recommendationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-t-2 border-rose-600 rounded-full"></div>
                    </div>
                  ) : (
                    <ProfileRecommendations 
                      recommendations={recommendations}
                      onActionClick={handleRecommendationAction}
                    />
                  )}
                </TabsContent>

                <TabsContent value="visibility" className="mt-6">
                  <ProfileVisibilityManager
                    settings={visibilitySettings}
                    onSettingsChange={handleVisibilitySettingsChange}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default Profile;
