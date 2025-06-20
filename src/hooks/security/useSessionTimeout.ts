
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../use-toast';

interface UseSessionTimeoutProps {
  currentUserId: string | null;
  sessionTimeout: number;
  updateLastActivity: () => void;
}

export const useSessionTimeout = ({ 
  currentUserId, 
  sessionTimeout, 
  updateLastActivity 
}: UseSessionTimeoutProps) => {
  const { toast } = useToast();

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
      }, sessionTimeout);
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
  }, [currentUserId, sessionTimeout, toast, updateLastActivity]);
};
