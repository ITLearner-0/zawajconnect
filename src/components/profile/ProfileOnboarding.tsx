import React from 'react';
import OnboardingWrapper from '@/components/onboarding/OnboardingWrapper';
import BasicInformation from '@/components/profile/BasicInformation';
import EducationCareer from '@/components/profile/EducationCareer';
import ReligiousBackground from '@/components/profile/ReligiousBackground';
import AboutMe from '@/components/profile/AboutMe';
import WaliInformation from '@/components/profile/WaliInformation';
import PhotoUploadStep from '@/components/onboarding/PhotoUploadStep';
import VerificationStep from '@/components/onboarding/VerificationStep';
import OnboardingSummary from '@/components/onboarding/OnboardingSummary';
import { ProfileFormData, VerificationStatus } from '@/types/profile';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

interface ProfileOnboardingProps {
  isOnboarding: boolean;
  currentStep: number;
  currentStepId: string;
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
  verificationStatus: VerificationStatus;
  userEmail: string;
}

const ProfileOnboarding = ({
  isOnboarding,
  currentStep,
  currentStepId,
  steps,
  formData,
  handleChange,
  handleNext,
  handlePrevious,
  completeOnboarding,
  canProceedCurrentStep,
  getStepErrors,
  onPhotoChange,
  verificationStatus,
  userEmail,
}: ProfileOnboardingProps) => {
  const renderCurrentStepContent = () => {
    const wrap = (content: React.ReactNode) => (
      <IslamicPattern
        variant="background"
        intensity="light"
        className="p-6 rounded-lg bg-white shadow-md dark:bg-islamic-darkCard"
      >
        {content}
      </IslamicPattern>
    );

    switch (currentStepId) {
      case 'basic':
        return wrap(<BasicInformation formData={formData} handleChange={handleChange} />);
      case 'education':
        return wrap(<EducationCareer formData={formData} handleChange={handleChange} />);
      case 'religious':
        return wrap(<ReligiousBackground formData={formData} handleChange={handleChange} />);
      case 'about':
        return wrap(<AboutMe formData={formData} handleChange={handleChange} />);
      case 'photo':
        return wrap(
          <PhotoUploadStep
            avatarUrl={formData.profilePicture || ''}
            onPhotoChange={onPhotoChange}
            userName={formData.fullName}
          />
        );
      case 'verification':
        return wrap(
          <VerificationStep verificationStatus={verificationStatus} userEmail={userEmail} />
        );
      case 'wali':
        return wrap(
          <WaliInformation formData={formData} handleChange={handleChange} showRequired={true} />
        );
      case 'summary':
        return wrap(<OnboardingSummary formData={formData} />);
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
