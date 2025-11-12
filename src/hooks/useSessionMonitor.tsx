import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityEvents } from './useSecurityEvents';

export const useSessionMonitor = () => {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const { logSecurityEvent } = useSecurityEvents();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  useEffect(() => {
    if (!session?.expires_at) return;

    const checkSessionExpiry = async () => {
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // Show warning 5 minutes before expiry
      const warningTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (timeUntilExpiry <= warningTime && !sessionWarningShown) {
        setSessionWarningShown(true);
        
        // Log security event
        try {
          await logSecurityEvent(
            'session_expiry_warning',
            'low',
            'Session proche de l\'expiration',
            { expires_in_minutes: Math.ceil(timeUntilExpiry / 60000) }
          );
        } catch (error) {
          console.error('Failed to log security event:', error);
        }
        
        toast({
          title: "Session proche d'expirer",
          description: `Votre session expire dans ${Math.ceil(timeUntilExpiry / 60000)} minutes. Sauvegardez vos données !`,
          variant: "destructive",
          duration: 10000
        });
        
        // Try to refresh token proactively
        supabase.auth.refreshSession().catch(error => {
          console.error('Failed to refresh session:', error);
        });
      }
    };

    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    checkSessionExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [session, sessionWarningShown, toast, logSecurityEvent]);

  // Reset warning when session changes
  useEffect(() => {
    setSessionWarningShown(false);
  }, [session?.expires_at]);

  return {
    isSessionNearExpiry: session?.expires_at ? 
      (new Date(session.expires_at * 1000).getTime() - Date.now()) < 5 * 60 * 1000 : false
  };
};