// Security monitoring hook
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SuspiciousActivityDetector } from '@/services/security/suspiciousActivityDetector';
import { SecurityAuditLogger } from '@/services/security/auditLogger';
import { JWTManager } from '@/services/auth/jwtManager';
import { CSRFProtection } from '@/services/security/csrfProtection';

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  // Record user activity
  const recordActivity = useCallback(
    (action: string, metadata: Record<string, any> = {}) => {
      if (user) {
        SuspiciousActivityDetector.recordActivity(user.id, action, metadata);
      }
    },
    [user]
  );

  // Log security event
  const logSecurityEvent = useCallback(
    async (action: string, resource: string, success: boolean, details?: Record<string, any>) => {
      await SecurityAuditLogger.logEvent({
        userId: user?.id,
        action,
        resource,
        success,
        details,
      });
    },
    [user]
  );

  // Initialize security monitoring
  useEffect(() => {
    // Initialize CSRF protection
    CSRFProtection.initialize();

    // Initialize audit logger
    SecurityAuditLogger.initialize();

    // Monitor JWT token
    const tokenCheckInterval = setInterval(
      async () => {
        if (user) {
          const isValid = await JWTManager.validateToken();
          if (!isValid) {
            console.warn('JWT token validation failed');
          }
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes

    // Monitor page visibility for security
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordActivity('page_hidden');
      } else {
        recordActivity('page_visible');
      }
    };

    // Monitor navigation
    const handleNavigation = () => {
      recordActivity('navigation', { url: window.location.href });
    };

    // Monitor clicks on sensitive elements
    const handleSensitiveClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('sensitive') || target.closest('.sensitive')) {
        recordActivity('sensitive_click', {
          element: target.tagName,
          text: target.textContent?.substring(0, 50),
        });
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('click', handleSensitiveClick);

    return () => {
      clearInterval(tokenCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('click', handleSensitiveClick);
    };
  }, [user, recordActivity]);

  return {
    recordActivity,
    logSecurityEvent,
  };
};
