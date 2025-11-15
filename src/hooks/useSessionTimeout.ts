import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SessionTimeoutConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalSeconds: number;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  timeoutMinutes: 30,
  warningMinutes: 5,
  checkIntervalSeconds: 60,
};

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const config = DEFAULT_CONFIG;

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  const extendSession = useCallback(() => {
    resetActivity();
  }, [resetActivity]);

  const checkSessionTimeout = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const timeoutMs = config.timeoutMinutes * 60 * 1000;
    const warningMs = config.warningMinutes * 60 * 1000;

    if (timeSinceActivity >= timeoutMs) {
      // Session expired, sign out
      signOut();
      return;
    }

    if (timeSinceActivity >= timeoutMs - warningMs) {
      // Show warning
      const remaining = Math.ceil((timeoutMs - timeSinceActivity) / 1000);
      setRemainingTime(remaining);
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [user, lastActivity, config, signOut]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetActivity]);

  // Set up timeout checking interval
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSessionTimeout, config.checkIntervalSeconds * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user, checkSessionTimeout, config.checkIntervalSeconds]);

  return {
    showWarning,
    remainingTime,
    extendSession,
    resetActivity,
  };
};
