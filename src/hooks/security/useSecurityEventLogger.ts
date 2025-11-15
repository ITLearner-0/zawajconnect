import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityEventLogger = (currentUserId: string | null, deviceFingerprint: string) => {
  // Log security events to the new table
  const logSecurityEvent = useCallback(
    async (eventType: string, details: any = {}) => {
      if (!currentUserId) return;

      try {
        const { error } = await (supabase as any).from('security_events').insert({
          user_id: currentUserId,
          event_type: eventType,
          description: details.description || eventType,
          severity: details.severity || 'low',
          metadata: {
            ...details,
            device_fingerprint: deviceFingerprint,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
        });

        if (error) {
          console.error('Failed to log security event:', error);
        }
      } catch (error) {
        console.error('Security logging error:', error);
      }
    },
    [currentUserId, deviceFingerprint]
  );

  return { logSecurityEvent };
};
