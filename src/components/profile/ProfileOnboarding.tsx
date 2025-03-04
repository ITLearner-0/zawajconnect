
import React from "react";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import BasicInformation from "@/components/profile/BasicInformation";
import EducationCareer from "@/components/profile/EducationCareer";
import ReligiousBackground from "@/components/profile/ReligiousBackground";
import AboutMe from "@/components/profile/AboutMe";
import WaliInformation from "@/components/profile/WaliInformation";
import { ProfileFormData } from "@/types/profile";
import { IslamicPattern } from "@/components/ui/islamic-pattern";

interface ProfileOnboardingProps {
  isOnboarding: boolean;
  currentStep: number;
  steps: string[];
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  completeOnboarding: () => void;
  canProceedCurrentStep: () => boolean;
}

const ProfileOnboarding = ({
  isOnboarding,
  currentStep,
  steps,
  formData,
  handleChange,
  handleNext,
  handlePrevious,
  completeOnboarding,
  canProceedCurrentStep,
}: ProfileOnboardingProps) => {
  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <IslamicPattern variant="background" intensity="light" className="p-6 rounded-lg">
            <BasicInformation formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 1:
        return (
          <IslamicPattern variant="background" intensity="light" className="p-6 rounded-lg">
            <EducationCareer formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 2:
        return (
          <IslamicPattern variant="background" intensity="light" className="p-6 rounded-lg">
            <ReligiousBackground formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 3:
        return (
          <IslamicPattern variant="background" intensity="light" className="p-6 rounded-lg">
            <AboutMe formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 4:
        return formData.gender === "female" ? (
          <IslamicPattern variant="background" intensity="light" className="p-6 rounded-lg">
            <WaliInformation formData={formData} handleChange={handleChange} showRequired={true} />
          </IslamicPattern>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <OnboardingWrapper
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onComplete={() => {
        completeOnboarding();
        // Note: handleSubmit will be called in the parent component
      }}
      canProceed={canProceedCurrentStep()}
    >
      {renderCurrentStepContent()}
    </OnboardingWrapper>
  );
};

export default ProfileOnboarding;
