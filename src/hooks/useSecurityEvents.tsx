import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  description: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  resolved: boolean;
  created_at: string;
}

export const useSecurityEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Log a security event
  const logSecurityEvent = async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_severity: severity,
        p_description: description,
        p_metadata: metadata
      });

      if (error) throw error;

      // Show critical alerts to user
      if (severity === 'critical' || severity === 'high') {
        toast({
          title: "Alerte de sécurité",
          description: description,
          variant: "destructive",
          duration: 10000
        });
      }

      return data;
    } catch (error) {
      console.error('Failed to log security event:', error);
      return null;
    }
  };

  // Load user security events (admin only)
  const loadSecurityEvents = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error && !error.message.includes('permission denied')) {
        throw error;
      }

      setEvents((data || []).map(event => ({
        ...event,
        metadata: event.metadata as Record<string, any> || {},
        ip_address: event.ip_address as string || undefined,
        user_agent: event.user_agent || undefined
      })));
    } catch (error) {
      console.error('Failed to load security events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Monitor for suspicious activity
  const checkSuspiciousActivity = async () => {
    if (!user) return;

    const metadata = {
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Check for rapid requests
    const requestCount = sessionStorage.getItem('request_count') || '0';
    const requestTimestamp = sessionStorage.getItem('request_timestamp') || '0';
    const now = Date.now();
    const lastRequest = parseInt(requestTimestamp);

    if (now - lastRequest < 60000) { // Within 1 minute
      const count = parseInt(requestCount) + 1;
      sessionStorage.setItem('request_count', count.toString());
      
      if (count > 30) { // More than 30 requests per minute
        await logSecurityEvent(
          'suspicious_activity',
          'high',
          'Taux de requêtes anormalement élevé détecté',
          { ...metadata, request_count: count }
        );
      }
    } else {
      sessionStorage.setItem('request_count', '1');
      sessionStorage.setItem('request_timestamp', now.toString());
    }
  };

  useEffect(() => {
    if (user) {
      loadSecurityEvents();
      checkSuspiciousActivity();
    }
  }, [user]);

  return {
    events,
    loading,
    logSecurityEvent,
    loadSecurityEvents,
    checkSuspiciousActivity
  };
};