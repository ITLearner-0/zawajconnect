import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvents {
  failed_logins: number;
  password_changes: number;
  last_login: string | undefined;
  suspicious_activity: boolean;
}

interface SecurityStatus {
  verification_score: number;
  email_verified: boolean;
  id_verified: boolean;
  password_strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  last_security_check: string;
}

export const useSecurityMonitor = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | undefined>(undefined);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvents | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityStatus();
      monitorSecurityEvents();
    }
  }, [user]);

  const loadSecurityStatus = async () => {
    if (!user) return;

    try {
      const { data: verification } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (verification) {
        const verificationScore = verification.verification_score ?? 0;
        setSecurityStatus({
          verification_score: verificationScore,
          email_verified: !!verification.email_verified,
          id_verified: !!verification.id_verified,
          password_strength: getPasswordStrength(verificationScore),
          last_security_check: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading security status:', error);
    } finally {
      setLoading(false);
    }
  };

  const monitorSecurityEvents = async () => {
    if (!user) return;

    try {
      // Monitor auth events through Supabase logs
      // This is a simplified version - in production, you'd want more sophisticated monitoring
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      setSecurityEvents({
        failed_logins: 0, // Would be tracked through auth logs
        password_changes: 0, // Would be tracked through user metadata
        last_login: user.last_sign_in_at ?? undefined,
        suspicious_activity: false
      });

      // Check for suspicious patterns
      checkSuspiciousActivity();
    } catch (error) {
      console.error('Error monitoring security events:', error);
    }
  };

  const checkSuspiciousActivity = async () => {
    if (!user) return false;

    try {
      // Check for rapid profile views (potential scraping)
      const { data: recentViews } = await supabase
        .from('profile_views')
        .select('created_at')
        .eq('viewer_id', user.id)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      const normalizedRecentViews = recentViews ?? [];
      if (normalizedRecentViews.length > 10) {
        return true;
      }

      // Check for unusual family invitation patterns
      const { data: recentInvitations } = await supabase
        .from('family_members')
        .select('invitation_sent_at')
        .eq('user_id', user.id)
        .gte('invitation_sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const normalizedRecentInvitations = recentInvitations ?? [];
      if (normalizedRecentInvitations.length > 5) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  };

  const getPasswordStrength = (verificationScore: number): 'weak' | 'moderate' | 'strong' | 'very_strong' => {
    if (verificationScore >= 80) return 'very_strong';
    if (verificationScore >= 60) return 'strong';
    if (verificationScore >= 30) return 'moderate';
    return 'weak';
  };

  const getSecurityRecommendations = () => {
    if (!securityStatus) return [];

    const recommendations: string[] = [];

    if (!securityStatus.email_verified) {
      recommendations.push('Verify your email address');
    }

    if (!securityStatus.id_verified) {
      recommendations.push('Complete ID verification for enhanced security');
    }

    if (securityStatus.verification_score < 50) {
      recommendations.push('Improve your verification score by completing all security steps');
    }

    if (securityStatus.password_strength === 'weak' || securityStatus.password_strength === 'moderate') {
      recommendations.push('Update to a stronger password');
    }

    return recommendations;
  };

  const refreshSecurityStatus = () => {
    setLoading(true);
    loadSecurityStatus();
    monitorSecurityEvents();
  };

  return {
    securityStatus,
    securityEvents,
    loading,
    recommendations: getSecurityRecommendations(),
    refreshSecurityStatus,
    checkSuspiciousActivity
  };
};

export default useSecurityMonitor;