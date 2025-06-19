
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileOnboarding from "@/components/profile/ProfileOnboarding";
import ProfileAnalytics from "@/components/profile/ProfileAnalytics";
import ProfileRecommendations from "@/components/profile/ProfileRecommendations";
import ProfileVisibilityManager from "@/components/profile/ProfileVisibilityManager";
import StandardLoadingState from "@/components/ui/StandardLoadingState";
import { useProfilePageLogic } from "./hooks/useProfilePageLogic";

const ProfilePage = () => {
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
    handleVerificationFieldChange,
    handlePrivacyFieldChange,
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

  // Create a wrapper that converts the field-based handler to an event-based handler for ProfileForm
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleChange(e);
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

  if (isOnboarding) {
    return (
      <AccessibilityProvider>
        <ProfileOnboarding
          isOnboarding={isOnboarding}
          currentStep={currentStep}
          steps={steps}
          formData={formData}
          handleChange={handleFieldChange}
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
                    handleChange={handleProfileFormChange}
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
                  <StandardLoadingState
                    loading={analyticsLoading}
                    loadingText="Loading analytics..."
                    emptyState={{
                      title: "No Analytics Data",
                      description: "Analytics data will appear here once you start using the platform."
                    }}
                  >
                    <ProfileAnalytics analytics={analytics} />
                  </StandardLoadingState>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-6">
                  <StandardLoadingState
                    loading={recommendationsLoading}
                    loadingText="Loading recommendations..."
                    emptyState={{
                      title: "No Recommendations",
                      description: "Profile recommendations will appear here based on your activity."
                    }}
                  >
                    <ProfileRecommendations 
                      recommendations={recommendations}
                      onActionClick={handleRecommendationAction}
                    />
                  </StandardLoadingState>
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

export default ProfilePage;
