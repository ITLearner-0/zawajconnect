
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseDeviceFingerprintSyncProps {
  deviceFingerprint: string;
  updateDeviceFingerprint: (fingerprint: string) => void;
}

export const useDeviceFingerprintSync = ({ deviceFingerprint, updateDeviceFingerprint }: UseDeviceFingerprintSyncProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !deviceFingerprint) return;

    const syncFingerprint = async () => {
      try {
        // Check if this device fingerprint is already associated with the user
        const { data: existingSession } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('device_info->fingerprint', deviceFingerprint)
          .single();

        if (!existingSession) {
          // This is a new device, log it
          await supabase.from('security_events').insert({
            user_id: user.id,
            event_type: 'new_device_detected',
            device_fingerprint: deviceFingerprint,
            details: {
              fingerprint: deviceFingerprint,
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          });

          // Create new session record
          await supabase.from('user_sessions').insert({
            user_id: user.id,
            session_token: crypto.randomUUID(),
            device_info: {
              fingerprint: deviceFingerprint,
              user_agent: navigator.userAgent,
              platform: navigator.platform
            }
          });
        } else {
          // Update existing session
          await supabase
            .from('user_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', existingSession.id);
        }

        updateDeviceFingerprint(deviceFingerprint);
      } catch (error) {
        console.error('Failed to sync device fingerprint:', error);
      }
    };

    syncFingerprint();
  }, [user, deviceFingerprint, updateDeviceFingerprint]);
};
