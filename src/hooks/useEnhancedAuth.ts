
import { useEffect, useCallback } from 'react';
import { useUserSession } from './useUserSession';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useDeviceFingerprinting } from './security/useDeviceFingerprinting';
import { usePasswordValidation } from './security/usePasswordValidation';
import { useSecurityState } from './security/useSecurityState';

export const useEnhancedAuth = () => {
  const { currentUserId, loading } = useUserSession();
  const { toast } = useToast();
  const { deviceFingerprint, generateDeviceFingerprint } = useDeviceFingerprinting();
  const { validatePasswordStrength } = usePasswordValidation();
  const {
    securityState,
    securitySettings,
    recordFailedAttempt,
    resetFailedAttempts,
    isAccountLocked,
    updateDeviceFingerprint,
    updateLastActivity
  } = useSecurityState();

  // Update device fingerprint in security state
  useEffect(() => {
    if (deviceFingerprint) {
      updateDeviceFingerprint(deviceFingerprint);
    }
  }, [deviceFingerprint, updateDeviceFingerprint]);

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
      updateLastActivity();
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
  }, [currentUserId, securitySettings.sessionTimeout, toast, updateLastActivity]);

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
