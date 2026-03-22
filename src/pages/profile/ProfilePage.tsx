import { Card, CardContent } from '@/components/ui/card';
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
import TrustScoreCard from '@/components/profile/cards/TrustScoreCard';
import IslamicProfileCard from '@/components/profile/cards/IslamicProfileCard';
import NikahJourneyCard from '@/components/profile/cards/NikahJourneyCard';
import ValuesProfileCard from '@/components/profile/cards/ValuesProfileCard';
import FamilyCard from '@/components/profile/cards/FamilyCard';
import SearchCriteriaCard from '@/components/profile/cards/SearchCriteriaCard';
import { useProfilePageLogic } from './hooks/useProfilePageLogic';
import { useIslamicPreferences } from '@/hooks/profile/useIslamicPreferences';
import { useJourneyProgress } from '@/hooks/profile/useJourneyProgress';
import { useFamilyContributions } from '@/hooks/profile/useFamilyContributions';
import { useTrustScore } from '@/hooks/profile/useTrustScore';

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

  // Load enriched profile data from Phase 2 tables
  const { preferences: islamicPrefs } = useIslamicPreferences(userId);
  const { progress: journeyProgress } = useJourneyProgress(userId);
  const { familyData } = useFamilyContributions(userId);
  const { trustData } = useTrustScore(userId);

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

  const verificationScore = trustData.publicTrustScore || (
    [verificationStatus.email, verificationStatus.phone, verificationStatus.id, verificationStatus.wali]
      .filter(Boolean).length * 25
  );

  const completionScore = Math.min(100, Math.round(
    [formData.fullName, formData.age, formData.gender, formData.location,
     formData.education, formData.occupation, formData.aboutMe,
     formData.religiousLevel, formData.prayerFrequency, formData.profilePicture]
      .filter(Boolean).length * 10
  ));

  return (
    <AccessibilityProvider>
      <div
        className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8"
        role="main"
        aria-labelledby="profile-heading"
      >
        <div className="container max-w-5xl mx-auto px-5 space-y-4">
          {/* Header — nouveau design sauge */}
          <ProfileHeader
            userEmail={userEmail}
            userId={userId}
            hasCompatibilityResults={hasCompatibilityResults ?? undefined}
            onSignOut={handleSignOut}
            verificationStatus={verificationStatus}
            waliActive={verificationStatus.wali}
            fullName={formData.fullName}
            avatarUrl={formData.profilePicture}
            location={formData.location}
            age={formData.age}
            profession={formData.occupation}
            completionScore={completionScore}
          />

          {/* Tabs navigation */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="analytics">Statistiques</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              <TabsTrigger value="visibility">Visibilité</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              {/* 2-column layout: sidebar (200px) + main content */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                {/* COLONNE GAUCHE — sticky */}
                <div className="flex flex-col gap-4 md:sticky md:top-4">
                  <TrustScoreCard
                    verificationStatus={verificationStatus}
                    verificationScore={verificationScore}
                    hasCompatibilityTest={trustData.compatibilityTestCompleted || (hasCompatibilityResults ?? false)}
                  />
                  <NikahJourneyCard
                    profileCompleted={journeyProgress.profileCompleted || (!!formData.aboutMe && !!formData.fullName)}
                    compatibilityDone={journeyProgress.compatibilityDone || (hasCompatibilityResults ?? false)}
                    firstMatch={journeyProgress.firstMatch}
                    supervisedExchange={journeyProgress.supervisedExchange}
                    familyMeeting={journeyProgress.familyMeeting}
                    istikharaCompleted={journeyProgress.istikharaCompleted}
                    nikah={journeyProgress.nikah}
                  />
                </div>

                {/* COLONNE DROITE */}
                <div className="flex flex-col gap-4">
                  <IslamicProfileCard
                    formData={formData}
                    hijabPreference={islamicPrefs.hijabPreference ?? undefined}
                    beardPreference={islamicPrefs.beardPreference ?? undefined}
                  />
                  <ValuesProfileCard />
                  <FamilyCard
                    waliActive={verificationStatus.wali}
                    contribution={familyData.contribution}
                    familyCriteria={familyData.criteria}
                  />
                  <SearchCriteriaCard aboutMe={formData.aboutMe} />

                  {/* Formulaire d'édition du profil */}
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-4">
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

            <TabsContent value="recommendations" className="space-y-6 mt-4">
              {userId && (
                <ProfileRecommendations
                  userId={userId}
                  recommendations={recommendations}
                  loading={recommendationsLoading}
                  onRecommendationAction={handleRecommendationAction}
                />
              )}
            </TabsContent>

            <TabsContent value="visibility" className="space-y-6 mt-4">
              {userId && (
                <ProfileVisibilityManager
                  userId={userId}
                  settings={visibilitySettings}
                  onSettingsChange={handleVisibilitySettingsChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default ProfilePage;
