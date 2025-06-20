
import { useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useUserSession } from '@/hooks/useUserSession';

interface SecurityEvent {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'profile_update' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

export const SecurityEventLogger = () => {
  const { logSecurityEvent } = useEnhancedAuth();
  const { currentUserId } = useUserSession();

  useEffect(() => {
    if (!currentUserId) return;

    // Log successful login
    logSecurityEvent('login', { severity: 'low' });

    // Monitor for suspicious activity patterns
    const monitorSuspiciousActivity = () => {
      // Detect rapid page navigation
      let pageChangeCount = 0;
      const resetPageCount = () => { pageChangeCount = 0; };
      
      const handlePageChange = () => {
        pageChangeCount++;
        if (pageChangeCount > 20) { // More than 20 page changes in 1 minute
          logSecurityEvent('suspicious_activity', {
            severity: 'medium',
            type: 'rapid_navigation',
            count: pageChangeCount
          });
        }
      };

      // Monitor for unusual API request patterns
      const originalFetch = window.fetch;
      let apiCallCount = 0;
      
      window.fetch = async (...args) => {
        apiCallCount++;
        if (apiCallCount > 100) { // More than 100 API calls in 1 minute
          logSecurityEvent('suspicious_activity', {
            severity: 'high',
            type: 'excessive_api_calls',
            count: apiCallCount
          });
        }
        return originalFetch(...args);
      };

      // Reset counters every minute
      const interval = setInterval(() => {
        resetPageCount();
        apiCallCount = 0;
      }, 60000);

      // Listen for navigation changes
      window.addEventListener('popstate', handlePageChange);

      return () => {
        clearInterval(interval);
        window.removeEventListener('popstate', handlePageChange);
        window.fetch = originalFetch;
      };
    };

    const cleanup = monitorSuspiciousActivity();

    return () => {
      // Log logout when component unmounts
      logSecurityEvent('logout', { severity: 'low' });
      cleanup?.();
    };
  }, [currentUserId, logSecurityEvent]);

  // Monitor for failed authentication attempts
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_failed_attempts' && e.newValue) {
        const attempts = parseInt(e.newValue);
        if (attempts >= 3) {
          logSecurityEvent('failed_login', {
            severity: 'medium',
            attempts
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logSecurityEvent]);

  return null; // This is a monitoring component, no UI needed
};
