
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SessionTimeoutConfig } from '@/types/session';

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  timeoutMinutes: 30,
  warningMinutes: 5,
  checkIntervalSeconds: 60
};

export const useSessionTimeout = (config: Partial<SessionTimeoutConfig> = {}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const sessionToken = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Generate session token
  const generateSessionToken = useCallback(() => {
    return `${user?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, [user?.id]);

  // Update session activity
  const updateActivity = useCallback(async () => {
    if (!user || !sessionToken.current) return;

    try {
      await supabase.rpc('update_session_activity', {
        session_token: sessionToken.current
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, [user]);

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (!user) return;

    const token = generateSessionToken();
    sessionToken.current = token;

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      };

      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_token: token,
        device_info: deviceInfo
      });
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [user, generateSessionToken]);

  // Handle session timeout
  const handleTimeout = useCallback(async () => {
    setShowWarning(false);
    toast({
      title: "Session expirée",
      description: "Vous avez été déconnecté pour inactivité",
      variant: "destructive"
    });
    await signOut();
  }, [toast, signOut]);

  // Show timeout warning
  const showTimeoutWarning = useCallback(() => {
    setShowWarning(true);
    setRemainingTime(finalConfig.warningMinutes * 60);

    const countdown = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finalConfig.warningMinutes]);

  // Reset timeout timers
  const resetTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    setShowWarning(false);
    
    // Set warning timer
    warningRef.current = setTimeout(
      showTimeoutWarning,
      (finalConfig.timeoutMinutes - finalConfig.warningMinutes) * 60 * 1000
    );
    
    // Set timeout timer
    timeoutRef.current = setTimeout(
      handleTimeout,
      finalConfig.timeoutMinutes * 60 * 1000
    );
  }, [finalConfig, showTimeoutWarning, handleTimeout]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    updateActivity();
    resetTimers();
  }, [updateActivity, resetTimers]);

  // Extend session
  const extendSession = useCallback(() => {
    handleActivity();
    setShowWarning(false);
  }, [handleActivity]);

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check session periodically
    checkIntervalRef.current = setInterval(() => {
      updateActivity();
    }, finalConfig.checkIntervalSeconds * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, handleActivity, updateActivity, finalConfig.checkIntervalSeconds]);

  // Initialize session on mount
  useEffect(() => {
    if (user) {
      initializeSession();
      resetTimers();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [user, initializeSession, resetTimers]);

  return {
    showWarning,
    remainingTime,
    extendSession,
    handleActivity
  };
};
