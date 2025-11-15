/**
 * Component to monitor email verification status
 * Place this in the app layout to automatically check and award badges
 */

import { useEmailVerificationCheck } from '@/hooks/useEmailVerificationCheck';

export const EmailVerificationMonitor: React.FC = () => {
  useEmailVerificationCheck();
  return null;
};
