
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDeviceFingerprintSyncProps {
  deviceFingerprint: string;
  updateDeviceFingerprint: (fingerprint: string) => void;
}

export const useDeviceFingerprintSync = ({
  deviceFingerprint,
  updateDeviceFingerprint
}: UseDeviceFingerprintSyncProps) => {
  useEffect(() => {
    const syncDeviceFingerprint = async () => {
      if (!deviceFingerprint) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Store device fingerprint in security events for tracking
        await (supabase as any).rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: 'device_fingerprint_sync',
          p_description: 'Device fingerprint synced',
          p_severity: 'low',
          p_metadata: {
            device_fingerprint: deviceFingerprint,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to sync device fingerprint:', error);
      }
    };

    syncDeviceFingerprint();
  }, [deviceFingerprint]);
};
