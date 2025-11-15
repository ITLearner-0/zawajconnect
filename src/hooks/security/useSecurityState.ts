import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireMFA: boolean;
  passwordExpiryDays: number;
}

interface SecurityState {
  failedAttempts: number;
  isLocked: boolean;
  lockoutUntil: Date | null;
  lastActivity: Date;
  deviceFingerprint: string;
  sessionValid: boolean;
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  maxFailedAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 60,
  requireMFA: false,
  passwordExpiryDays: 90,
};

export const useSecurityState = () => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    failedAttempts: 0,
    isLocked: false,
    lockoutUntil: null,
    lastActivity: new Date(),
    deviceFingerprint: '',
    sessionValid: true,
  });

  const [securitySettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);

  const recordFailedAttempt = useCallback(
    async (userId?: string) => {
      if (!userId) return;

      try {
        // Log the failed attempt
        await (supabase as any).rpc('log_security_event', {
          p_user_id: userId,
          p_event_type: 'failed_login_attempt',
          p_description: 'Failed login attempt',
          p_severity: 'medium',
        });

        setSecurityState((prev) => {
          const newFailedAttempts = prev.failedAttempts + 1;
          const shouldLock = newFailedAttempts >= securitySettings.maxFailedAttempts;

          return {
            ...prev,
            failedAttempts: newFailedAttempts,
            isLocked: shouldLock,
            lockoutUntil: shouldLock
              ? new Date(Date.now() + securitySettings.lockoutDuration * 60000)
              : null,
          };
        });
      } catch (error) {
        console.error('Failed to record security event:', error);
      }
    },
    [securitySettings.maxFailedAttempts, securitySettings.lockoutDuration]
  );

  const resetFailedAttempts = useCallback(() => {
    setSecurityState((prev) => ({
      ...prev,
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    }));
  }, []);

  const isAccountLocked = useCallback(() => {
    if (!securityState.isLocked || !securityState.lockoutUntil) return false;

    const now = new Date();
    if (now > securityState.lockoutUntil) {
      // Auto-unlock if lockout period has passed
      setSecurityState((prev) => ({
        ...prev,
        isLocked: false,
        lockoutUntil: null,
        failedAttempts: 0,
      }));
      return false;
    }

    return true;
  }, [securityState.isLocked, securityState.lockoutUntil]);

  const updateDeviceFingerprint = useCallback((fingerprint: string) => {
    setSecurityState((prev) => ({
      ...prev,
      deviceFingerprint: fingerprint,
    }));
  }, []);

  const updateLastActivity = useCallback(() => {
    setSecurityState((prev) => ({
      ...prev,
      lastActivity: new Date(),
    }));
  }, []);

  return {
    securityState,
    securitySettings,
    recordFailedAttempt,
    resetFailedAttempts,
    isAccountLocked,
    updateDeviceFingerprint,
    updateLastActivity,
  };
};
