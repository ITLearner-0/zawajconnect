
import { useState, useEffect, useCallback } from 'react';

interface DeviceFingerprint {
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  colorDepth: number;
  deviceMemory?: number;
  hash: string;
}

export const useDeviceFingerprinting = () => {
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  const generateDeviceFingerprint = useCallback(async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas fingerprinting
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint canvas', 2, 2);
    }
    
    const canvasFingerprint = canvas.toDataURL();

    // WebGL fingerprinting
    const webglCanvas = document.createElement('canvas');
    const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
    let webglInfo = '';
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        webglInfo = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + 
                   gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    const fingerprint: DeviceFingerprint = {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory,
      hash: ''
    };

    // Create hash from all fingerprint data
    const fingerprintString = JSON.stringify(fingerprint) + canvasFingerprint + webglInfo;
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprintString));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    fingerprint.hash = hashHex;
    
    return hashHex;
  }, []);

  useEffect(() => {
    generateDeviceFingerprint().then(setDeviceFingerprint);
  }, [generateDeviceFingerprint]);

  return {
    deviceFingerprint,
    generateDeviceFingerprint
  };
};
