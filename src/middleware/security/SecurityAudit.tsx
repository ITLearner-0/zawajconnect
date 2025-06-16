
import { useAuth } from '@/contexts/AuthContext';
import { validateSecurityHeaders, checkRateLimit } from '@/utils/security/securityUtils';

export const useSecurityAudit = () => {
  const { user, session } = useAuth();

  const performSecurityAudit = async (): Promise<{
    isSecure: boolean;
    threatLevel: 'low' | 'medium' | 'high';
  }> => {
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
      
      console.log(`🔒 Security audit complete: ${secure ? 'SECURE' : 'INSECURE'} (${currentThreatLevel})`);
      
      return { isSecure: secure, threatLevel: currentThreatLevel };
    } catch (error) {
      console.error('❌ Security audit failed:', error);
      return { isSecure: false, threatLevel: 'high' };
    }
  };

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

  return { performSecurityAudit };
};
