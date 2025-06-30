
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileOnboarding from "@/components/profile/ProfileOnboarding";
import ProfileAnalytics from "@/components/profile/ProfileAnalytics";
import ProfileRecommendations from "@/components/profile/ProfileRecommendations";
import ProfileVisibilityManager from "@/components/profile/ProfileVisibilityManager";
import StandardLoadingState from "@/components/ui/StandardLoadingState";
import { useProfilePageLogic } from "./hooks/useProfilePageLogic";

const ProfilePage = () => {
  const navigate = useNavigate();
  
  const {
    // Profile data
    formData,
    isNewUser,
    userEmail,
    userId,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    hasCompatibilityResults,
    
    // Handlers
    handleChange,
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSaveProfile,
    handleSignOut,
    handleToggleVisibility,
    handleUnblockUser,
    handleVisibilitySettingsChange,
    
    // Onboarding
    isOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep,
    
    // Analytics and recommendations
    analytics,
    analyticsLoading,
    recommendations,
    recommendationsLoading,
    handleRecommendationAction,
    
    // Visibility settings
    visibilitySettings
  } = useProfilePageLogic();

  // Create a wrapper that converts field-based changes to the expected format for onboarding
  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    // Create a synthetic event that matches the expected signature
    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };

  // Create a wrapper that converts event-based handler to field-based handler for ProfileForm
  const handleProfileFormChange = (field: keyof typeof formData, value: any) => {
    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };

  // Create a wrapper that converts field-based handler to event-based handler for ProfileOnboarding
  const handleOnboardingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleChange(e);
  };

  // Enhanced save handler with navigation
  const handleEnhancedSaveProfile = async () => {
    const result = await handleSaveProfile();
    if (result && result.success && result.shouldNavigateToCompatibility) {
      // Navigate to compatibility test if needed
      setTimeout(() => {
        navigate("/compatibility");
      }, 2000);
    }
  };

  // Show loading state if data is not ready
  if (!formData) {
    return <StandardLoadingState loading={true} loadingText="Chargement du profil..." />;
  }

  if (isOnboarding) {
    return (
      <AccessibilityProvider>
        <ProfileOnboarding
          isOnboarding={isOnboarding}
          currentStep={currentStep}
          steps={steps}
          formData={formData}
          handleChange={handleOnboardingChange}
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
          <Card className="shadow-lg border-rose-200 dark:border-rose-800">
            <CardHeader className="bg-gradient-to-r from-rose-400 to-pink-400 text-white">
              <ProfileHeader
                userEmail={userEmail}
                userId={userId}
                hasCompatibilityResults={hasCompatibilityResults}
                onSignOut={handleSignOut}
              />
            </CardHeader>

            <CardContent className="p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="analytics">Statistiques</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                  <TabsTrigger value="visibility">Visibilité</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <ProfileForm
                    formData={formData}
                    handleChange={handleProfileFormChange}
                    handleSubmit={handleEnhancedSaveProfile}
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
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {userId && (
                    <ProfileAnalytics
                      userId={userId}
                      analytics={analytics}
                      loading={analyticsLoading}
                    />
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                  {userId && (
                    <ProfileRecommendations
                      userId={userId}
                      recommendations={recommendations}
                      loading={recommendationsLoading}
                      onRecommendationAction={handleRecommendationAction}
                    />
                  )}
                </TabsContent>

                <TabsContent value="visibility" className="space-y-6">
                  {userId && (
                    <ProfileVisibilityManager
                      userId={userId}
                      settings={visibilitySettings}
                      onSettingsChange={handleVisibilitySettingsChange}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default ProfilePage;
