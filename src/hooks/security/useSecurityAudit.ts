import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  actionType: string;
  resourceType: string;
  resourceId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export const useSecurityAudit = () => {
  const { user } = useAuth();
  const [logging, setLogging] = useState(false);

  const logSecurityEvent = useCallback(
    async (event: SecurityEvent) => {
      if (!user) return;

      setLogging(true);
      try {
        const { error } = await supabase.from('security_events').insert({
          user_id: user.id,
          event_type: event.actionType,
          details: {
            resource_type: event.resourceType,
            resource_id: event.resourceId,
            success: event.success,
            error_message: event.errorMessage,
            metadata: event.metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
        });

        if (error) {
          console.error('Failed to log security event:', error);
        }
      } catch (err) {
        console.error('Security audit error:', err);
      } finally {
        setLogging(false);
      }
    },
    [user]
  );

  const logProfileAccess = useCallback(
    (profileId: string, success: boolean, error?: string) => {
      logSecurityEvent({
        actionType: 'profile_access',
        resourceType: 'profile',
        resourceId: profileId,
        success,
        errorMessage: error,
      });
    },
    [logSecurityEvent]
  );

  const logMessageSent = useCallback(
    (conversationId: string, success: boolean, error?: string) => {
      logSecurityEvent({
        actionType: 'message_send',
        resourceType: 'message',
        resourceId: conversationId,
        success,
        errorMessage: error,
      });
    },
    [logSecurityEvent]
  );

  const logLoginAttempt = useCallback(
    (success: boolean, error?: string, metadata?: Record<string, any>) => {
      logSecurityEvent({
        actionType: 'login_attempt',
        resourceType: 'auth',
        success,
        errorMessage: error,
        metadata,
      });
    },
    [logSecurityEvent]
  );

  const logPrivacyChange = useCallback(
    (settingType: string, success: boolean, metadata?: Record<string, any>) => {
      logSecurityEvent({
        actionType: 'privacy_change',
        resourceType: 'privacy',
        resourceId: settingType,
        success,
        metadata,
      });
    },
    [logSecurityEvent]
  );

  return {
    logSecurityEvent,
    logProfileAccess,
    logMessageSent,
    logLoginAttempt,
    logPrivacyChange,
    logging,
  };
};
