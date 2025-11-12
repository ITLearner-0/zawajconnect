import { useUserSession } from './useUserSession';
import { useDeviceFingerprinting } from './security/useDeviceFingerprinting';
import { usePasswordValidation } from './security/usePasswordValidation';
import { useSecurityState } from './security/useSecurityState';
import { useSessionTimeout } from './security/useSessionTimeout';
import { useSecurityEventLogger } from './security/useSecurityEventLogger';
import { useDeviceFingerprintSync } from './security/useDeviceFingerprintSync';

export const useEnhancedAuth = () => {
  const { currentUserId, loading } = useUserSession();
  const { deviceFingerprint, generateDeviceFingerprint } = useDeviceFingerprinting();
  const { validatePasswordStrength } = usePasswordValidation();
  const {
    securityState,
    securitySettings,
    recordFailedAttempt,
    resetFailedAttempts,
    isAccountLocked,
    updateDeviceFingerprint,
    updateLastActivity,
  } = useSecurityState();

  // Sync device fingerprint
  useDeviceFingerprintSync({
    deviceFingerprint,
    updateDeviceFingerprint,
  });

  // Handle session timeout
  useSessionTimeout({
    currentUserId,
    sessionTimeout: securitySettings.sessionTimeout,
    updateLastActivity,
  });

  // Security event logging
  const { logSecurityEvent } = useSecurityEventLogger(
    currentUserId,
    securityState.deviceFingerprint
  );

  return {
    securityState,
    securitySettings,
    validatePasswordStrength,
    recordFailedAttempt,
    resetFailedAttempts,
    isAccountLocked,
    logSecurityEvent,
    generateDeviceFingerprint,
  };
};
