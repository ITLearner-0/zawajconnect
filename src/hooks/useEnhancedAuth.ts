
import { useState, useEffect, useCallback } from 'react';
import { useUserSession } from './useUserSession';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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

export const useEnhancedAuth = () => {
  const { currentUserId, loading } = useUserSession();
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

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 0, 0);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint.slice(-50)
    }));
    
    return fingerprint;
  }, []);

  // Initialize device fingerprint
  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setSecurityState(prev => ({ ...prev, deviceFingerprint: fingerprint }));
  }, [generateDeviceFingerprint]);

  // Session timeout monitoring
  useEffect(() => {
    if (!currentUserId) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast({
          title: "Session Expired",
          description: "For your security, you have been logged out due to inactivity.",
          variant: "destructive"
        });
        supabase.auth.signOut();
      }, securitySettings.sessionTimeout);
    };

    const updateActivity = () => {
      setSecurityState(prev => ({ ...prev, lastActivity: new Date() }));
      resetTimeout();
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [currentUserId, securitySettings.sessionTimeout, toast]);

  // Password strength validation
  const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { isValid: errors.length === 0, errors };
  };

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

  // Log security events to the new table
  const logSecurityEvent = useCallback(async (eventType: string, details: any = {}) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: currentUserId,
          event_type: eventType,
          device_fingerprint: securityState.deviceFingerprint,
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }, [currentUserId, securityState.deviceFingerprint]);

  return {
    securityState,
    securitySettings,
    validatePasswordStrength,
    recordFailedAttempt,
    resetFailedAttempts,
    isAccountLocked,
    logSecurityEvent,
    generateDeviceFingerprint
  };
};
