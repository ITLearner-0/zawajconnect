
import { useState, useCallback, useEffect } from 'react';

export const useDeviceFingerprinting = () => {
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 0, 0);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint.slice(-50)
    }));
    
    return fingerprint;
  }, []);

  // Initialize device fingerprint
  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);
  }, [generateDeviceFingerprint]);

  return {
    deviceFingerprint,
    generateDeviceFingerprint
  };
};
