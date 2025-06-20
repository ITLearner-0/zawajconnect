
import { useEffect } from 'react';

interface UseDeviceFingerprintSyncProps {
  deviceFingerprint: string;
  updateDeviceFingerprint: (fingerprint: string) => void;
}

export const useDeviceFingerprintSync = ({ 
  deviceFingerprint, 
  updateDeviceFingerprint 
}: UseDeviceFingerprintSyncProps) => {
  // Update device fingerprint in security state
  useEffect(() => {
    if (deviceFingerprint) {
      updateDeviceFingerprint(deviceFingerprint);
    }
  }, [deviceFingerprint, updateDeviceFingerprint]);
};
