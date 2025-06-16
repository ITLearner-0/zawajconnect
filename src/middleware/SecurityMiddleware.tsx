import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateSecurityHeaders, checkRateLimit } from '@/utils/security/securityUtils';
import { toast } from 'sonner';

interface SecurityContextType {
  isSecure: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  lastSecurityCheck: Date | null;
  performSecurityAudit: () => Promise<void>;
  validateUserAction: (action: string, data?: any) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [isSecure, setIsSecure] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [lastSecurityCheck, setLastSecurityCheck] = useState<Date | null>(null);

  // Security audit function
  const performSecurityAudit = async (): Promise<void> => {
    try {
      console.log('🔒 Performing security audit...');
      
      // Check headers
      const headersValid = validateSecurityHeaders();
      
      // Check session validity
      const sessionValid = session && new Date(session.expires_at || 0) > new Date();
      
      // Check user verification status
      const userVerified = user?.email_confirmed_at !== null;
      
      // Calculate threat level
      let currentThreatLevel: 'low' | 'medium' | 'high' = 'low';
      let secure = true;
      
      if (!headersValid) {
        currentThreatLevel = 'medium';
        console.warn('⚠️ Security headers missing or invalid');
      }
      
      if (!sessionValid) {
        currentThreatLevel = 'high';
        secure = false;
        console.warn('⚠️ Session invalid or expired');
      }
      
      if (!userVerified) {
        currentThreatLevel = currentThreatLevel === 'high' ? 'high' : 'medium';
        console.warn('⚠️ User email not verified');
      }
      
      // Check for suspicious activity patterns
      const suspiciousActivity = await checkSuspiciousActivity();
      if (suspiciousActivity) {
        currentThreatLevel = 'high';
        secure = false;
      }
      
      setIsSecure(secure);
      setThreatLevel(currentThreatLevel);
      setLastSecurityCheck(new Date());
      
      // Log security status
      console.log(`🔒 Security audit complete: ${secure ? 'SECURE' : 'INSECURE'} (${currentThreatLevel})`);
      
    } catch (error) {
      console.error('❌ Security audit failed:', error);
      setIsSecure(false);
      setThreatLevel('high');
    }
  };

  // Check for suspicious activity
  const checkSuspiciousActivity = async (): Promise<boolean> => {
    // Check for rapid requests
    const recentRequests = getRecentRequestCount();
    if (recentRequests > 100) {
      console.warn('⚠️ Suspicious activity: Too many requests');
      return true;
    }
    
    // Check for unusual login patterns
    if (session) {
      const lastSignIn = new Date(session.user.last_sign_in_at || '');
      const timeDiff = Date.now() - lastSignIn.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      if (hoursDiff < 0.1) { // Less than 6 minutes
        console.warn('⚠️ Suspicious activity: Very recent login');
        return true;
      }
    }
    
    return false;
  };

  // Get recent request count (simplified implementation)
  const getRecentRequestCount = (): number => {
    const requests = localStorage.getItem('recent_requests');
    if (!requests) return 0;
    
    try {
      const parsed = JSON.parse(requests);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      return parsed.filter((timestamp: number) => timestamp > fiveMinutesAgo).length;
    } catch {
      return 0;
    }
  };

  // Validate user action
  const validateUserAction = async (action: string, data?: any): Promise<boolean> => {
    try {
      // Rate limiting check
      if (!checkRateLimit(`action_${action}`, 10, 60000)) {
        toast.error('Trop de tentatives. Veuillez patienter.');
        return false;
      }
      
      // Security level check
      if (threatLevel === 'high') {
        toast.error('Action bloquée pour des raisons de sécurité');
        return false;
      }
      
      // Session validity check
      if (!session || new Date(session.expires_at || 0) <= new Date()) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return false;
      }
      
      // Log successful validation
      console.log(`✅ Action validated: ${action}`);
      
      // Track request
      trackRequest();
      
      return true;
    } catch (error) {
      console.error('❌ Action validation failed:', error);
      return false;
    }
  };

  // Track request for rate limiting
  const trackRequest = () => {
    const requests = localStorage.getItem('recent_requests');
    const parsed = requests ? JSON.parse(requests) : [];
    parsed.push(Date.now());
    
    // Keep only last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const filtered = parsed.filter((timestamp: number) => timestamp > fiveMinutesAgo);
    
    localStorage.setItem('recent_requests', JSON.stringify(filtered));
  };

  // Initial security check
  useEffect(() => {
    performSecurityAudit();
    
    // Periodic security checks
    const interval = setInterval(performSecurityAudit, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [user, session]);

  // Security event listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔒 Tab hidden - pausing security checks');
      } else {
        console.log('🔒 Tab visible - resuming security checks');
        performSecurityAudit();
      }
    };

    const handleBeforeUnload = () => {
      console.log('🔒 Page unloading - clearing sensitive data');
      // Clear sensitive data
      sessionStorage.clear();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        isSecure,
        threatLevel,
        lastSecurityCheck,
        performSecurityAudit,
        validateUserAction
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityMiddleware = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityMiddleware must be used within a SecurityMiddleware');
  }
  return context;
};
