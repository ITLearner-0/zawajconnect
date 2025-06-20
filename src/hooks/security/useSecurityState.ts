
import { useState, useCallback } from 'react';
import { useToast } from '../use-toast';

interface SecuritySettings {
  sessionTimeout: number;
  maxFailedAttempts: number;
  lockoutDuration: number;
  requireStrongPassword: boolean;
}

interface AuthSecurityState {
  failedAttempts: number;
  lockedUntil: Date | null;
  lastActivity: Date;
  deviceFingerprint: string;
}

export const useSecurityState = () => {
  const { toast } = useToast();
  
  const [securityState, setSecurityState] = useState<AuthSecurityState>({
    failedAttempts: 0,
    lockedUntil: null,
    lastActivity: new Date(),
    deviceFingerprint: ''
  });

  const [securitySettings] = useState<SecuritySettings>({
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    requireStrongPassword: true
  });

  // Track failed login attempts
  const recordFailedAttempt = useCallback(() => {
    setSecurityState(prev => {
      const newFailedAttempts = prev.failedAttempts + 1;
      
      if (newFailedAttempts >= securitySettings.maxFailedAttempts) {
        const lockoutUntil = new Date(Date.now() + securitySettings.lockoutDuration);
        toast({
          title: "Account Temporarily Locked",
          description: `Too many failed attempts. Try again after ${securitySettings.lockoutDuration / 60000} minutes.`,
          variant: "destructive"
        });
        
        return {
          ...prev,
          failedAttempts: newFailedAttempts,
          lockedUntil: lockoutUntil
        };
      }
      
      return { ...prev, failedAttempts: newFailedAttempts };
    });
  }, [securitySettings, toast]);

  // Reset failed attempts on successful login
  const resetFailedAttempts = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      failedAttempts: 0,
      lockedUntil: null
    }));
  }, []);

  // Check if account is currently locked
  const isAccountLocked = useCallback(() => {
    if (!securityState.lockedUntil) return false;
    return new Date() < securityState.lockedUntil;
  }, [securityState.lockedUntil]);

  const updateDeviceFingerprint = useCallback((fingerprint: string) => {
    setSecurityState(prev => ({ ...prev, deviceFingerprint: fingerprint }));
  }, []);

  const updateLastActivity = useCallback(() => {
    setSecurityState(prev => ({ ...prev, lastActivity: new Date() }));
  }, []);

  return {
    securityState,
    securitySettings,
    recordFailedAttempt,
    resetFailedAttempts,
    isAccountLocked,
    updateDeviceFingerprint,
    updateLastActivity
  };
};
