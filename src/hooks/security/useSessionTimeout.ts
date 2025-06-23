
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { JWTManager } from '@/services/auth/jwtManager';
import { toast } from 'sonner';

interface UseSessionTimeoutProps {
  currentUserId: string | null;
  sessionTimeout: number;
  updateLastActivity: () => void;
}

export const useSessionTimeout = ({ currentUserId, sessionTimeout, updateLastActivity }: UseSessionTimeoutProps) => {
  const { signOut } = useAuth();

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    updateLastActivity();
  }, [updateLastActivity]);

  // Handle session timeout
  const handleSessionTimeout = useCallback(async () => {
    toast.error('Session expired', {
      description: 'You have been logged out due to inactivity.'
    });
    
    await JWTManager.forceLogout('Session timeout');
    await signOut();
  }, [signOut]);

  useEffect(() => {
    if (!currentUserId) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);

      // Show warning 5 minutes before timeout
      warningId = setTimeout(() => {
        toast.warning('Session expiring soon', {
          description: 'Your session will expire in 5 minutes. Please save your work.',
          duration: 10000
        });
      }, sessionTimeout - 5 * 60 * 1000);

      // Set main timeout
      timeoutId = setTimeout(handleSessionTimeout, sessionTimeout);
    };

    // Activity events to track
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetActivityTimer();
      resetTimeout();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [currentUserId, sessionTimeout, resetActivityTimer, handleSessionTimeout]);
};
