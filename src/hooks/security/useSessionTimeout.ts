import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSessionTimeoutProps {
  currentUserId: string | null;
  sessionTimeout: number; // in minutes
  updateLastActivity: () => void;
}

export const useSessionTimeout = ({
  currentUserId,
  sessionTimeout,
  updateLastActivity,
}: UseSessionTimeoutProps) => {
  const checkSessionValidity = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Session is invalid, redirect to login
        window.location.href = '/auth';
        return;
      }

      // Check if session has expired based on our timeout
      const sessionStart = new Date(session.user.last_sign_in_at || '');
      const now = new Date();
      const minutesElapsed = (now.getTime() - sessionStart.getTime()) / (1000 * 60);

      if (minutesElapsed > sessionTimeout) {
        // Session has expired, sign out
        await supabase.auth.signOut();
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }, [currentUserId, sessionTimeout]);

  useEffect(() => {
    if (!currentUserId) return;

    // Check session validity every 5 minutes
    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000);

    // Update last activity on user interactions
    const handleUserActivity = () => {
      updateLastActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [currentUserId, checkSessionValidity, updateLastActivity]);
};
