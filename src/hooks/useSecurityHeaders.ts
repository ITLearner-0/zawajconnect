
import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set up Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }

    // Set up other security headers via meta tags
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    headers.forEach(header => {
      if (!document.querySelector(`meta[name="${header.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = header.name;
        meta.content = header.content;
        document.head.appendChild(meta);
      }
    });

    return () => {
      // Cleanup is handled by the browser when the page unloads
    };
  }, []);
};
