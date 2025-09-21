import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityEvents } from './useSecurityEvents';

interface SessionInfo {
  id: string;
  device_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  last_activity: string;
  expires_at?: string;
  created_at: string;
}

export const useEnhancedSessionMonitor = () => {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const { logSecurityEvent } = useSecurityEvents();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  // Generate device fingerprint
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      cookies: navigator.cookieEnabled,
      plugins: Array.from(navigator.plugins).map(p => p.name).sort()
    })).slice(0, 32);
    
    setDeviceFingerprint(fingerprint);
    return fingerprint;
  };

  // Track session activity
  const trackSessionActivity = async () => {
    if (!user || !session) return;

    try {
      const fingerprint = deviceFingerprint || generateDeviceFingerprint();
      
      const sessionData = {
        user_id: user.id,
        session_token: session.access_token.slice(-10), // Only last 10 chars for privacy
        device_fingerprint: fingerprint,
        user_agent: navigator.userAgent,
        is_active: true,
        expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      };

      // Insert or update session info
      const { error } = await supabase
        .from('user_sessions')
        .upsert(sessionData, { 
          onConflict: 'session_token',
          ignoreDuplicates: false 
        });

      if (error && !error.message.includes('permission denied')) {
        console.error('Failed to track session:', error);
      }
    } catch (error) {
      console.error('Session tracking error:', error);
    }
  };

  // Load active sessions
  const loadActiveSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error && !error.message.includes('permission denied')) {
        throw error;
      }

      setActiveSessions((data || []).map(session => ({
        ...session,
        ip_address: session.ip_address as string || undefined,
        device_fingerprint: session.device_fingerprint || undefined,
        user_agent: session.user_agent || undefined,
        expires_at: session.expires_at || undefined
      })));

      // Check for suspicious multiple sessions
      if (data && data.length > 3) {
        await logSecurityEvent(
          'multiple_sessions',
          'medium',
          `${data.length} sessions actives détectées`,
          { session_count: data.length, devices: data.map(s => s.device_fingerprint) }
        );
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Check for session anomalies
  const checkSessionAnomalies = async () => {
    if (!user || activeSessions.length === 0) return;

    const currentFingerprint = deviceFingerprint || generateDeviceFingerprint();
    const knownDevices = activeSessions.map(s => s.device_fingerprint).filter(Boolean);
    
    if (knownDevices.length > 0 && !knownDevices.includes(currentFingerprint)) {
      await logSecurityEvent(
        'new_device_detected',
        'medium',
        'Nouvel appareil détecté pour cette session',
        { 
          new_device: currentFingerprint,
          known_devices: knownDevices.length,
          user_agent: navigator.userAgent
        }
      );

      toast({
        title: "Nouvel appareil détecté",
        description: "Connexion depuis un nouvel appareil. Vérifiez vos sessions actives.",
        variant: "default",
        duration: 8000
      });
    }
  };

  // Enhanced session expiry check
  useEffect(() => {
    if (!session?.expires_at) return;

    const checkSessionExpiry = async () => {
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // Show warning 10 minutes before expiry
      const warningTime = 10 * 60 * 1000;
      
      if (timeUntilExpiry <= warningTime && !sessionWarningShown) {
        setSessionWarningShown(true);
        
        await logSecurityEvent(
          'session_expiry_warning',
          'low',
          'Session proche de l\'expiration',
          { expires_in_minutes: Math.ceil(timeUntilExpiry / 60000) }
        );
        
        toast({
          title: "Session proche d'expirer",
          description: `Votre session expire dans ${Math.ceil(timeUntilExpiry / 60000)} minutes.`,
          variant: "destructive",
          duration: 15000
        });
        
        // Try to refresh token proactively
        supabase.auth.refreshSession().catch(error => {
          console.error('Failed to refresh session:', error);
        });
      }
    };

    const interval = setInterval(checkSessionExpiry, 60000);
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [session, sessionWarningShown, logSecurityEvent]);

  // Track session on mount and activity
  useEffect(() => {
    if (user && session) {
      generateDeviceFingerprint();
      trackSessionActivity();
      loadActiveSessions();
    }
  }, [user, session]);

  // Check for anomalies when sessions change
  useEffect(() => {
    if (activeSessions.length > 0 && deviceFingerprint) {
      checkSessionAnomalies();
    }
  }, [activeSessions, deviceFingerprint]);

  // Track user activity
  useEffect(() => {
    const trackActivity = () => trackSessionActivity();
    
    const events = ['mousedown', 'keydown', 'scroll', 'click'];
    events.forEach(event => document.addEventListener(event, trackActivity));
    
    const activityInterval = setInterval(trackActivity, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      events.forEach(event => document.removeEventListener(event, trackActivity));
      clearInterval(activityInterval);
    };
  }, [user, session, deviceFingerprint]);

  // Reset warning when session changes
  useEffect(() => {
    setSessionWarningShown(false);
  }, [session?.expires_at]);

  return {
    activeSessions,
    deviceFingerprint,
    isSessionNearExpiry: session?.expires_at ? 
      (new Date(session.expires_at * 1000).getTime() - Date.now()) < 10 * 60 * 1000 : false,
    loadActiveSessions
  };
};