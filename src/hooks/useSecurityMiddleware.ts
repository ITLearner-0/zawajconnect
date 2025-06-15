
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateSessionSecurity } from '@/services/auth/securityEnforcement';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { useToast } from '@/hooks/use-toast';

export const useSecurityMiddleware = () => {
  const { user, session } = useAuth();
  const { checkRateLimit } = useRateLimiting();
  const { toast } = useToast();
  const [securityStatus, setSecurityStatus] = useState({
    isSecure: false,
    emailVerified: false,
    sessionValid: false,
    loading: true
  });

  useEffect(() => {
    const checkSecurity = async () => {
      if (!user || !session) {
        setSecurityStatus({
          isSecure: false,
          emailVerified: false,
          sessionValid: false,
          loading: false
        });
        return;
      }

      try {
        // Check email verification
        const emailVerified = !!session.user.email_confirmed_at;
        
        // Check session validity
        const sessionValid = await validateSessionSecurity();
        
        const isSecure = emailVerified && sessionValid;
        
        setSecurityStatus({
          isSecure,
          emailVerified,
          sessionValid,
          loading: false
        });

        if (!emailVerified) {
          toast({
            title: "Vérification email requise",
            description: "Certaines fonctionnalités sont limitées jusqu'à la vérification de votre email",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityStatus({
          isSecure: false,
          emailVerified: false,
          sessionValid: false,
          loading: false
        });
      }
    };

    checkSecurity();
  }, [user, session, toast]);

  const validateAction = async (action: string, data?: any): Promise<boolean> => {
    // Check rate limiting
    const rateLimitPassed = await checkRateLimit(action, data);
    if (!rateLimitPassed) {
      return false;
    }

    // Check security status
    if (!securityStatus.isSecure) {
      toast({
        title: "Action non autorisée",
        description: "Veuillez vérifier votre email et vous reconnecter",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    securityStatus,
    validateAction,
    isSecure: securityStatus.isSecure,
    loading: securityStatus.loading
  };
};
