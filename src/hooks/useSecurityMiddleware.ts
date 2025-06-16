
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityStatus {
  isSecure: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  loading: boolean;
}

export const useSecurityMiddleware = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSecure: false,
    emailVerified: false,
    phoneVerified: false,
    loading: true
  });

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setSecurityStatus({
          isSecure: false,
          emailVerified: false,
          phoneVerified: false,
          loading: false
        });
        return;
      }

      // Check email verification
      const emailVerified = session.user.email_confirmed_at !== null;

      // Check phone verification (if available)
      const phoneVerified = session.user.phone_confirmed_at !== null;

      // Check profile verification status
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified, phone_verified, id_verified')
        .eq('id', session.user.id)
        .single();

      const isSecure = emailVerified && (profile?.email_verified || false);

      setSecurityStatus({
        isSecure,
        emailVerified: emailVerified || (profile?.email_verified || false),
        phoneVerified: phoneVerified || (profile?.phone_verified || false),
        loading: false
      });
    } catch (error) {
      console.error('Error checking security status:', error);
      setSecurityStatus({
        isSecure: false,
        emailVerified: false,
        phoneVerified: false,
        loading: false
      });
    }
  };

  const validateAction = async (action: string, data?: any): Promise<boolean> => {
    // Basic validation - check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('Action blocked: User not authenticated');
      return false;
    }

    // Additional validation based on action type
    switch (action) {
      case 'profile_save':
        if (!securityStatus.emailVerified) {
          console.warn('Action blocked: Email not verified');
          return false;
        }
        break;
      case 'profile_update':
        // Allow basic profile updates
        break;
      default:
        break;
    }

    return true;
  };

  return {
    securityStatus,
    validateAction,
    checkSecurityStatus
  };
};
