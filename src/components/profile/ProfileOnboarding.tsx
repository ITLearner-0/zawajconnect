import React from 'react';
import OnboardingWrapper from '@/components/onboarding/OnboardingWrapper';
import BasicInformation from '@/components/profile/BasicInformation';
import EducationCareer from '@/components/profile/EducationCareer';
import ReligiousBackground from '@/components/profile/ReligiousBackground';
import AboutMe from '@/components/profile/AboutMe';
import WaliInformation from '@/components/profile/WaliInformation';
import PhotoUploadStep from '@/components/onboarding/PhotoUploadStep';
import OnboardingSummary from '@/components/onboarding/OnboardingSummary';
import { ProfileFormData } from '@/types/profile';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

interface ProfileOnboardingProps {
  isOnboarding: boolean;
  currentStep: number;
  steps: string[];
  formData: ProfileFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  completeOnboarding: () => void;
  canProceedCurrentStep: () => boolean;
  getStepErrors: () => string[];
  onPhotoChange: (url: string) => void;
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
  getStepErrors,
  onPhotoChange,
}: ProfileOnboardingProps) => {
  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <BasicInformation formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 1:
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <EducationCareer formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 2:
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <ReligiousBackground formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 3:
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <AboutMe formData={formData} handleChange={handleChange} />
          </IslamicPattern>
        );
      case 4:
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <PhotoUploadStep
              avatarUrl={formData.profilePicture || ''}
              onPhotoChange={onPhotoChange}
              userName={formData.fullName}
            />
          </IslamicPattern>
        );
      case 5:
        if (formData.gender === 'female') {
          return (
            <IslamicPattern
              variant="background"
              intensity="light"
              className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
            >
              <WaliInformation formData={formData} handleChange={handleChange} showRequired={true} />
            </IslamicPattern>
          );
        }
        // For non-female users, step 5 is the summary
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <OnboardingSummary formData={formData} />
          </IslamicPattern>
        );
      case 6:
        // For female users, step 6 is the summary
        return (
          <IslamicPattern
            variant="background"
            intensity="light"
            className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
          >
            <OnboardingSummary formData={formData} />
          </IslamicPattern>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-islamic-solidGreen dark:bg-islamic-darkGreen py-12">
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
        errors={getStepErrors()}
      >
        {renderCurrentStepContent()}
      </OnboardingWrapper>
    </div>
  );
};

export default ProfileOnboarding;
