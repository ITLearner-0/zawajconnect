
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

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    if (!user) return;

    setLogging(true);
    try {
      const { error } = await supabase.rpc('log_security_event', {
        _user_id: user.id,
        _action_type: event.actionType,
        _resource_type: event.resourceType,
        _resource_id: event.resourceId || null,
        _success: event.success,
        _error_message: event.errorMessage || null,
        _metadata: event.metadata ? JSON.stringify(event.metadata) : null
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (err) {
      console.error('Security audit error:', err);
    } finally {
      setLogging(false);
    }
  }, [user]);

  const logProfileAccess = useCallback((profileId: string, success: boolean, error?: string) => {
    logSecurityEvent({
      actionType: 'profile_access',
      resourceType: 'profile',
      resourceId: profileId,
      success,
      errorMessage: error
    });
  }, [logSecurityEvent]);

  const logMessageSent = useCallback((conversationId: string, success: boolean, error?: string) => {
    logSecurityEvent({
      actionType: 'message_send',
      resourceType: 'message',
      resourceId: conversationId,
      success,
      errorMessage: error
    });
  }, [logSecurityEvent]);

  const logLoginAttempt = useCallback((success: boolean, error?: string, metadata?: Record<string, any>) => {
    logSecurityEvent({
      actionType: 'login_attempt',
      resourceType: 'auth',
      success,
      errorMessage: error,
      metadata
    });
  }, [logSecurityEvent]);

  const logPrivacyChange = useCallback((settingType: string, success: boolean, metadata?: Record<string, any>) => {
    logSecurityEvent({
      actionType: 'privacy_change',
      resourceType: 'privacy',
      resourceId: settingType,
      success,
      metadata
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logProfileAccess,
    logMessageSent,
    logLoginAttempt,
    logPrivacyChange,
    logging
  };
};
