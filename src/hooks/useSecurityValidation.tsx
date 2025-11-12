import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  requiredScore?: number;
  currentScore?: number;
}

export const useSecurityValidation = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityEvents();
  const { securityStatus } = useSecurityMonitor();
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);

  // Validate if user can perform family operations
  const validateFamilyOperation = useCallback(async (
    operationType: 'invitation' | 'supervision' | 'approval',
    requiredScore: number = 80
  ): Promise<ValidationResult> => {
    if (!user || !securityStatus) {
      return { 
        isValid: false, 
        reason: 'Utilisateur non authentifié ou données de sécurité indisponibles' 
      };
    }

    const currentScore = securityStatus.verification_score || 0;
    const emailVerified = securityStatus.email_verified || false;
    const idVerified = securityStatus.id_verified || false;

    // Check basic verification requirements
    if (!emailVerified) {
      await logSecurityEvent(
        'validation_failed',
        'medium',
        `Tentative d'opération familiale sans email vérifié: ${operationType}`,
        { operation_type: operationType, reason: 'email_not_verified' }
      );

      return {
        isValid: false,
        reason: 'Email non vérifié. Vérifiez votre email avant de continuer.',
        requiredScore,
        currentScore
      };
    }

    // Check ID verification for sensitive operations
    if ((operationType === 'supervision' || operationType === 'approval') && !idVerified) {
      await logSecurityEvent(
        'validation_failed',
        'high',
        `Tentative d'opération sensible sans ID vérifié: ${operationType}`,
        { operation_type: operationType, reason: 'id_not_verified' }
      );

      return {
        isValid: false,
        reason: 'Vérification d\'identité requise pour cette opération.',
        requiredScore,
        currentScore
      };
    }

    // Check security score
    if (currentScore < requiredScore) {
      await logSecurityEvent(
        'validation_failed',
        'medium',
        `Score de sécurité insuffisant pour ${operationType}`,
        { 
          operation_type: operationType, 
          required_score: requiredScore,
          current_score: currentScore
        }
      );

      return {
        isValid: false,
        reason: `Score de sécurité insuffisant. Requis: ${requiredScore}, Actuel: ${currentScore}`,
        requiredScore,
        currentScore
      };
    }

    // Log successful validation
    await logSecurityEvent(
      'validation_success',
      'low',
      `Validation réussie pour ${operationType}`,
      { 
        operation_type: operationType,
        score: currentScore,
        email_verified: emailVerified,
        id_verified: idVerified
      }
    );

    return { isValid: true, currentScore, requiredScore };
  }, [user, securityStatus, logSecurityEvent]);

  // Validate message sending capabilities
  const validateMessagePermissions = useCallback(async (
    matchId: string,
    requiredScore: number = 60
  ): Promise<ValidationResult> => {
    if (!user || !securityStatus) {
      return { 
        isValid: false, 
        reason: 'Utilisateur non authentifié' 
      };
    }

    const currentScore = securityStatus.verification_score || 0;
    const emailVerified = securityStatus.email_verified || false;

    if (!emailVerified || currentScore < requiredScore) {
      await logSecurityEvent(
        'message_blocked',
        'medium',
        'Tentative d\'envoi de message avec vérification insuffisante',
        { 
          match_id: matchId,
          score: currentScore,
          email_verified: emailVerified
        }
      );

      return {
        isValid: false,
        reason: 'Vérification insuffisante pour envoyer des messages.',
        requiredScore,
        currentScore
      };
    }

    return { isValid: true, currentScore, requiredScore };
  }, [user, securityStatus, logSecurityEvent]);

  // Validate profile viewing permissions
  const validateProfileAccess = useCallback(async (
    targetUserId: string,
    requiredScore: number = 85
  ): Promise<ValidationResult> => {
    if (!user || !securityStatus) {
      return { 
        isValid: false, 
        reason: 'Utilisateur non authentifié' 
      };
    }

    // Users can always view their own profile
    if (user.id === targetUserId) {
      return { isValid: true };
    }

    const currentScore = securityStatus.verification_score || 0;
    const emailVerified = securityStatus.email_verified || false;
    const idVerified = securityStatus.id_verified || false;

    if (!emailVerified || !idVerified || currentScore < requiredScore) {
      await logSecurityEvent(
        'profile_access_denied',
        'medium',
        'Accès au profil refusé - vérification insuffisante',
        { 
          target_user_id: targetUserId,
          score: currentScore,
          email_verified: emailVerified,
          id_verified: idVerified
        }
      );

      return {
        isValid: false,
        reason: 'Vérification complète requise pour voir les profils.',
        requiredScore,
        currentScore
      };
    }

    return { isValid: true, currentScore, requiredScore };
  }, [user, securityStatus, logSecurityEvent]);

  // Show validation error to user
  const showValidationError = useCallback((result: ValidationResult) => {
    if (!result.isValid && result.reason) {
      toast({
        title: "Accès refusé",
        description: result.reason,
        variant: "destructive",
        duration: 8000
      });
    }
  }, [toast]);

  // Perform validation with UI feedback
  const validateWithFeedback = useCallback(async (
    validationFn: () => Promise<ValidationResult>
  ): Promise<boolean> => {
    setValidating(true);
    try {
      const result = await validationFn();
      if (!result.isValid) {
        showValidationError(result);
      }
      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Erreur de validation",
        description: "Une erreur est survenue lors de la vérification des permissions.",
        variant: "destructive"
      });
      return false;
    } finally {
      setValidating(false);
    }
  }, [showValidationError, toast]);

  return {
    validateFamilyOperation,
    validateMessagePermissions,
    validateProfileAccess,
    validateWithFeedback,
    showValidationError,
    validating
  };
};