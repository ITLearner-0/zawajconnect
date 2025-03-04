
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { useProfile } from "@/hooks/useProfile";
import BasicInformation from "@/components/profile/BasicInformation";
import EducationCareer from "@/components/profile/EducationCareer";
import ReligiousBackground from "@/components/profile/ReligiousBackground";
import AboutMe from "@/components/profile/AboutMe";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";

const Profile = () => {
  const navigate = useNavigate();
  const { formData, isNewUser, handleChange, handleSubmit, handleSignOut } = useProfile();
  
  const {
    isOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep
  } = useOnboarding(formData, isNewUser);

  // Render different step components based on current step
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
      default:
        return null;
    }
  };

  // Onboarding mode
  if (isOnboarding) {
    return (
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
    );
  }

  // Regular profile edit mode
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-center">Update Your Profile</h1>
              <CustomButton variant="outline" onClick={handleSignOut}>
                Sign Out
              </CustomButton>
            </div>
            <p className="text-center text-gray-600">
              Keep your profile information up to date
            </p>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <form onSubmit={handleSubmit} className="space-y-6">
                <BasicInformation formData={formData} handleChange={handleChange} />
                <EducationCareer formData={formData} handleChange={handleChange} />
                <ReligiousBackground formData={formData} handleChange={handleChange} />
                <AboutMe formData={formData} handleChange={handleChange} />

                <div className="flex justify-between pt-6">
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Back
                  </CustomButton>
                  <CustomButton type="submit">Save Profile</CustomButton>
                </div>
              </form>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
