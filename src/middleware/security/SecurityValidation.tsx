
import { toast } from 'sonner';
import { checkRateLimit } from '@/utils/security/securityUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { SecurityContext } from './SecurityContext';

export const useSecurityValidation = () => {
  const { session } = useAuth();
  const context = useContext(SecurityContext);
  
  if (!context) {
    throw new Error('useSecurityValidation must be used within a SecurityProvider');
  }
  
  const { threatLevel } = context;

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

  const trackRequest = () => {
    const requests = localStorage.getItem('recent_requests');
    const parsed = requests ? JSON.parse(requests) : [];
    parsed.push(Date.now());
    
    // Keep only last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const filtered = parsed.filter((timestamp: number) => timestamp > fiveMinutesAgo);
    
    localStorage.setItem('recent_requests', JSON.stringify(filtered));
  };

  return { validateUserAction };
};
