import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileOnboarding from '@/components/profile/ProfileOnboarding';
import ProfileAnalytics from '@/components/profile/ProfileAnalytics';
import ProfileRecommendations from '@/components/profile/ProfileRecommendations';
import ProfileVisibilityManager from '@/components/profile/ProfileVisibilityManager';
import StandardLoadingState from '@/components/ui/StandardLoadingState';
import { useProfilePageLogic } from './hooks/useProfilePageLogic';

const ProfilePage = () => {
  console.log('ProfilePage: Component rendering started');

  const navigate = useNavigate();

  console.log('ProfilePage: About to call useProfilePageLogic');

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
    loading,
    error,

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
    currentStepId,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep,
    getStepErrors,

    // Analytics and recommendations
    analytics,
    analyticsLoading,
    recommendations,
    recommendationsLoading,
    handleRecommendationAction,

    // Visibility settings
    visibilitySettings,
  } = useProfilePageLogic();

  console.log('ProfilePage: useProfilePageLogic returned:', {
    formData: !!formData,
    userId,
    loading,
    error,
    isOnboarding,
  });

  // Wrapper that converts field-based handler to event-based handler for ProfileForm
  const handleProfileFormChange = (field: keyof typeof formData, value: any) => {
    const syntheticEvent = {
      target: {
        name: field,
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

    handleChange(syntheticEvent);
  };

  // Create a wrapper that converts field-based handler to event-based handler for ProfileOnboarding
  const handleOnboardingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    handleChange(e);
  };

  // Enhanced save handler with navigation
  const handleEnhancedSaveProfile = async (): Promise<boolean> => {
    const result = await handleSaveProfile();
    if (result && result.success && result.shouldNavigateToMatches) {
      // Navigate to nearby matches page
      setTimeout(() => {
        navigate('/nearby');
      }, 2000);
      return true;
    }
    return result ? result.success : false;
  };

  // Auto-save profile when onboarding completes
  const handleCompleteOnboarding = async () => {
    completeOnboarding();
    // Save the profile data collected during onboarding
    await handleSaveProfile();
  };

  // Show loading state if data is not ready
  if (loading) {
    console.log('ProfilePage: Showing loading state');
    return <StandardLoadingState loading={true} loadingText="Chargement du profil..." />;
  }

  // Show error state if there's an error
  if (error) {
    console.log('ProfilePage: Showing error state:', error);

    // If user is not authenticated, redirect to auth page
    if (error.includes('No authenticated user found')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Authentification requise</h2>
              <p className="text-gray-600 mb-4">
                Vous devez être connecté pour accéder à votre profil.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-600"
              >
                Se connecter
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Other errors
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-600"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state if data is not ready
  if (!formData) {
    console.log('ProfilePage: No form data available, showing loading state');
    return <StandardLoadingState loading={true} loadingText="Chargement des données..." />;
  }

  console.log('ProfilePage: About to render main content');

  if (isOnboarding) {
    console.log('ProfilePage: Rendering onboarding');
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
          completeOnboarding={handleCompleteOnboarding}
          canProceedCurrentStep={canProceedCurrentStep}
          getStepErrors={getStepErrors}
          onPhotoChange={(url: string) => {
            handleChange({
              target: { name: 'profilePicture', value: url },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          verificationStatus={verificationStatus}
          userEmail={userEmail}
          currentStepId={currentStepId}
        />
      </AccessibilityProvider>
    );
  }

  console.log('ProfilePage: Rendering main profile page');

  return (
    <AccessibilityProvider>
      <div
        className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-12"
        role="main"
        aria-labelledby="profile-heading"
      >
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-rose-200 dark:border-rose-800">
            <CardHeader className="bg-gradient-to-r from-rose-400 to-pink-400 text-white">
              <ProfileHeader
                userEmail={userEmail}
                userId={userId}
                hasCompatibilityResults={hasCompatibilityResults ?? undefined}
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
                    <>
                      <BadgeShowcase userId={userId} maxBadges={5} />
                      <ProfileAnalytics
                        userId={userId}
                        analytics={analytics}
                        loading={analyticsLoading}
                      />
                    </>
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
