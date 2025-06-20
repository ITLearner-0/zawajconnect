
import { useEffect } from 'react';

export const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Generate nonce for inline scripts
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    
    // Create and update CSP meta tag
    const createCSPMeta = () => {
      let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        document.head.appendChild(meta);
      }

      // Enhanced CSP without unsafe-inline and unsafe-eval
      const cspContent = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://api.mapbox.com https://js.stripe.com`,
        "style-src 'self' 'unsafe-inline' https://api.mapbox.com", // Mapbox requires inline styles
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://huozosbrlxayjkvakptu.supabase.co wss://huozosbrlxayjkvakptu.supabase.co https://api.stripe.com",
        "worker-src 'self' blob:",
        "child-src 'self'",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ');

      meta.content = cspContent;
    };

    createCSPMeta();

    // Set up CSP reporting
    const setupCSPReporting = () => {
      document.addEventListener('securitypolicyviolation', (e) => {
        console.warn('CSP Violation:', {
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          originalPolicy: e.originalPolicy,
          disposition: e.disposition
        });

        // Log CSP violations to backend for monitoring
        fetch('/api/csp-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            violatedDirective: e.violatedDirective,
            blockedURI: e.blockedURI,
            documentURI: e.documentURI,
            sourceFile: e.sourceFile,
            lineNumber: e.lineNumber,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.error('Failed to report CSP violation:', err));
      });
    };

    setupCSPReporting();
  }, []);

  return null; // This component only sets up CSP, no UI
};
