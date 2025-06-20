
import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set additional security headers via meta tags where possible
    const setSecurityMeta = () => {
      const securityMetas = [
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
        { httpEquiv: 'Strict-Transport-Security', content: 'max-age=31536000; includeSubDomains; preload' },
        { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(self), payment=()' }
      ];

      securityMetas.forEach(meta => {
        let element = document.querySelector(`meta[${meta.httpEquiv ? 'http-equiv' : 'name'}="${meta.httpEquiv || meta.name}"]`);
        
        if (!element) {
          element = document.createElement('meta');
          if (meta.httpEquiv) {
            (element as HTMLMetaElement).httpEquiv = meta.httpEquiv;
          } else {
            (element as HTMLMetaElement).name = meta.name!;
          }
          document.head.appendChild(element);
        }
        
        (element as HTMLMetaElement).content = meta.content;
      });
    };

    setSecurityMeta();

    // Remove the clickjacking protection as it's causing security errors in iframe contexts
    // This would normally check if (window.self !== window.top) but that's not secure in iframes
    
    // Disable right-click context menu on sensitive areas (optional)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.sensitive-content')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
};
