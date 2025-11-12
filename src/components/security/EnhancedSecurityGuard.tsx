import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityGuardProps {
  children: React.ReactNode;
  requiredVerificationScore?: number;
  requireEmailVerification?: boolean;
  requireIdVerification?: boolean;
}

const EnhancedSecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  requiredVerificationScore = 60,
  requireEmailVerification = true,
  requireIdVerification = false
}) => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityEvents();
  const { isSessionNearExpiry } = useSessionMonitor();
  const { toast } = useToast();
  
  const [securityStatus, setSecurityStatus] = useState<{
    emailVerified: boolean;
    idVerified: boolean;
    verificationScore: number;
    isSecure: boolean;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkSecurityStatus();
  }, [user, requiredVerificationScore, requireEmailVerification, requireIdVerification]);

  const checkSecurityStatus = async () => {
    if (!user) return;

    try {
      // Check user verification status
      const { data: verificationData, error } = await supabase
        .from('user_verifications')
        .select('email_verified, id_verified, verification_score')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching verification status:', error);
        await createDefaultVerification();
        return;
      }

      const status = {
        emailVerified: verificationData?.email_verified || false,
        idVerified: verificationData?.id_verified || false,
        verificationScore: verificationData?.verification_score || 0,
        isSecure: true
      };

      // Check security requirements
      if (requireEmailVerification && !status.emailVerified) {
        status.isSecure = false;
        await logSecurityEvent(
          'access_denied_email_unverified',
          'medium',
          'Accès refusé - email non vérifié'
        );
      }

      if (requireIdVerification && !status.idVerified) {
        status.isSecure = false;
        await logSecurityEvent(
          'access_denied_id_unverified',
          'high',
          'Accès refusé - ID non vérifiée'
        );
      }

      if (status.verificationScore < requiredVerificationScore) {
        status.isSecure = false;
        await logSecurityEvent(
          'access_denied_low_verification',
          'medium',
          `Accès refusé - score insuffisant: ${status.verificationScore}/${requiredVerificationScore}`
        );
      }

      setSecurityStatus(status);
      setBlocked(!status.isSecure);

    } catch (error) {
      console.error('Security check failed:', error);
      setBlocked(true);
      
      toast({
        title: "Erreur de sécurité",
        description: "Impossible de vérifier votre statut de sécurité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultVerification = async () => {
    try {
      const { error } = await supabase
        .from('user_verifications')
        .insert({
          user_id: user!.id,
          email_verified: false,
          id_verified: false,
          verification_score: 10
        });

      if (error) throw error;
      
      // Retry check after creating verification record
      setTimeout(checkSecurityStatus, 1000);
    } catch (error) {
      console.error('Failed to create verification record:', error);
      setBlocked(true);
      setLoading(false);
    }
  };

  const handleVerificationRedirect = () => {
    window.location.href = '/profile?tab=verification';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 animate-pulse text-primary" />
          <span>Vérification de sécurité...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour accéder à cette fonctionnalité.
        </AlertDescription>
      </Alert>
    );
  }

  if (blocked || !securityStatus?.isSecure) {
    return (
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>Accès restreint pour des raisons de sécurité :</p>
            <ul className="text-sm space-y-1 ml-4">
              {requireEmailVerification && !securityStatus?.emailVerified && (
                <li>• Email non vérifié</li>
              )}
              {requireIdVerification && !securityStatus?.idVerified && (
                <li>• Identité non vérifiée</li>
              )}
              {securityStatus && securityStatus.verificationScore < requiredVerificationScore && (
                <li>• Score de vérification insuffisant ({securityStatus.verificationScore}/{requiredVerificationScore})</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>

        <Button onClick={handleVerificationRedirect} className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Compléter la Vérification
        </Button>
      </div>
    );
  }

  // Show session expiry warning if applicable
  if (isSessionNearExpiry) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Votre session expire bientôt. Sauvegardez vos modifications et reconnectez-vous.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default EnhancedSecurityGuard;