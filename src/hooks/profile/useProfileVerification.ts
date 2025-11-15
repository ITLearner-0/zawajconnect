import { useState } from 'react';
import { VerificationStatus } from '@/types/profile';

interface UseProfileVerificationProps {
  initialVerificationStatus: VerificationStatus;
}

export const useProfileVerification = ({
  initialVerificationStatus,
}: UseProfileVerificationProps) => {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(initialVerificationStatus);

  const handleVerificationChange = (field: keyof VerificationStatus, value: boolean) => {
    setVerificationStatus((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    verificationStatus,
    handleVerificationChange,
  };
};
