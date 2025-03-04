import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { useProfile } from "@/hooks/useProfile";
import BasicInformation from "@/components/profile/BasicInformation";
import EducationCareer from "@/components/profile/EducationCareer";
import ReligiousBackground from "@/components/profile/ReligiousBackground";
import AboutMe from "@/components/profile/AboutMe";
import VerificationPanel from "@/components/profile/VerificationPanel";
import WaliInformation from "@/components/profile/WaliInformation";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AccessibilityControls from "@/components/AccessibilityControls";

const Profile = () => {
  const navigate = useNavigate();
  const { 
    formData, 
    isNewUser, 
    userEmail,
    verificationStatus,
    handleChange, 
    handleSubmit, 
    handleSignOut,
    handleVerificationChange 
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

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInformation formData={formData} handleChange={handleChange} />;
      case 1:
        return <EducationCareer formData={formData} handleChange={handleChange} />;
      case 2:
        return <ReligiousBackground formData={formData} handleChange={handleChange} />;
      case 3:
        return <AboutMe formData={formData} handleChange={handleChange} />;
      case 4:
        return formData.gender === "female" ? 
          <WaliInformation formData={formData} handleChange={handleChange} showRequired={true} /> : null;
      default:
        return null;
    }
  };

  if (isOnboarding) {
    return (
      <AccessibilityProvider>
        <OnboardingWrapper
          steps={steps}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onComplete={() => {
            completeOnboarding();
            handleSubmit();
          }}
          canProceed={canProceedCurrentStep()}
        >
          {renderCurrentStepContent()}
        </OnboardingWrapper>
      </AccessibilityProvider>
    );
  }

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12" role="main" aria-labelledby="profile-heading">
        <div className="container max-w-3xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h1 id="profile-heading" className="text-2xl font-bold text-center">Update Your Profile</h1>
                <div className="flex items-center gap-2">
                  <AccessibilityControls />
                  <CustomButton 
                    variant="outline" 
                    onClick={handleSignOut}
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </CustomButton>
                </div>
              </div>
              <p className="text-center text-gray-600">
                Keep your profile information up to date
              </p>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <form 
                  onSubmit={handleSubmit} 
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default Profile;
