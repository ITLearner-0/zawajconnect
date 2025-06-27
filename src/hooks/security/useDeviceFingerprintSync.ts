
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
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_action: 'device_fingerprint_sync',
          p_resource_type: 'device',
          p_success: true,
          p_risk_level: 'low',
          p_details: {
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
