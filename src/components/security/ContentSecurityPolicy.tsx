import { useEffect } from 'react';

export const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Set Content Security Policy via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }

    return () => {
      // Cleanup on unmount - safely remove only if it's still in the DOM
      if (cspMeta.parentNode) {
        cspMeta.parentNode.removeChild(cspMeta);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};
