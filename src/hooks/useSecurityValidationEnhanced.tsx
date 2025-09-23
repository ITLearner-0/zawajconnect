import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  requiredScore?: number;
  currentScore?: number;
  additionalInfo?: Record<string, any>;
}

interface SecurityValidationHook {
  validateFamilyOperationEnhanced: (operationType: string, requiredScore?: number) => Promise<ValidationResult>;
  validateMessagePermissionsEnhanced: (matchId: string, requiredScore?: number) => Promise<ValidationResult>;
  validateProfileAccessEnhanced: (targetUserId: string, requiredScore?: number) => Promise<ValidationResult>;
  validateContactInfoAccess: (familyMemberId: string) => Promise<ValidationResult>;
  validateWithFeedback: (validationFn: () => Promise<ValidationResult>) => Promise<boolean>;
  showValidationError: (result: ValidationResult) => void;
  validating: boolean;
}

export const useSecurityValidationEnhanced = (): SecurityValidationHook => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityEvents();
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);

  const validateFamilyOperationEnhanced = async (
    operationType: string,
    requiredScore: number = 80
  ): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: "Utilisateur non authentifié" };
    }

    try {
      // Check user verification status
      const { data: verification, error: verificationError } = await supabase
        .rpc('get_user_verification_status_secure', { target_user_id: user.id });

      if (verificationError) {
        await logSecurityEvent(
          'verification_check_failed',
          'medium',
          `Échec de vérification pour opération famille: ${operationType}`,
          { error: verificationError.message, operation_type: operationType }
        );
        throw verificationError;
      }

      const userVerification = verification[0];
      if (!userVerification) {
        return {
          isValid: false,
          reason: "Données de vérification non trouvées",
          requiredScore,
          currentScore: 0
        };
      }

      // Enhanced validation based on operation type
      if (operationType === 'invitation' || operationType === 'supervision') {
        if (!userVerification.email_verified) {
          return {
            isValid: false,
            reason: "Vérification email requise pour les invitations familiales",
            requiredScore,
            currentScore: userVerification.verification_score || 0
          };
        }

        // Check daily limits based on verification level
        const { data: todayInvitations, error: invitationError } = await supabase
          .from('family_members')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (invitationError) throw invitationError;

        const dailyLimit = userVerification.verification_score >= 70 ? 10 : 3;
        if (todayInvitations.length >= dailyLimit) {
          return {
            isValid: false,
            reason: `Limite quotidienne d'invitations atteinte (${dailyLimit}). Vérifiez votre compte pour plus d'invitations.`,
            requiredScore,
            currentScore: userVerification.verification_score || 0,
            additionalInfo: { daily_limit: dailyLimit, current_count: todayInvitations.length }
          };
        }
      }

      // For high-security operations like 'approval', require ID verification
      if (operationType === 'approval' && !userVerification.id_verified) {
        return {
          isValid: false,
          reason: "Vérification d'identité requise pour les approbations familiales",
          requiredScore,
          currentScore: userVerification.verification_score || 0
        };
      }

      const currentScore = userVerification.verification_score || 0;
      if (currentScore < requiredScore) {
        return {
          isValid: false,
          reason: `Score de vérification insuffisant pour ${operationType}`,
          requiredScore,
          currentScore
        };
      }

      // Log successful validation
      await logSecurityEvent(
        'family_operation_validated',
        'low',
        `Opération familiale validée: ${operationType}`,
        {
          operation_type: operationType,
          verification_score: currentScore,
          required_score: requiredScore
        }
      );

      return { isValid: true, currentScore, requiredScore };
    } catch (error) {
      console.error('Family operation validation failed:', error);
      return { isValid: false, reason: "Erreur de validation" };
    }
  };

  const validateMessagePermissionsEnhanced = async (
    matchId: string,
    requiredScore: number = 60
  ): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: "Utilisateur non authentifié" };
    }

    try {
      // Check if user can access this match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
        // Check if user is authorized family member
        const { data: familyAccess, error: familyError } = await supabase
          .rpc('can_access_match_security_definer', {
            match_user1_id: match.user1_id,
            match_user2_id: match.user2_id
          });

        if (familyError || !familyAccess) {
          await logSecurityEvent(
            'unauthorized_message_attempt',
            'high',
            'Tentative d\'envoi de message non autorisée',
            { match_id: matchId, attempted_by: user.id }
          );
          
          return {
            isValid: false,
            reason: "Accès non autorisé à cette conversation"
          };
        }
      }

      // Validate both sender and recipient verification
      const senderId = user.id;
      const recipientId = match.user1_id === senderId ? match.user2_id : match.user1_id;

      const { data: senderVerification, error: senderError } = await supabase
        .rpc('get_user_verification_status_secure', { target_user_id: senderId });

      const { data: recipientVerification, error: recipientError } = await supabase
        .rpc('get_user_verification_status_secure', { target_user_id: recipientId });

      if (senderError || recipientError) {
        throw new Error('Erreur de vérification des utilisateurs');
      }

      const senderScore = senderVerification[0]?.verification_score || 0;
      const recipientScore = recipientVerification[0]?.verification_score || 0;

      if (senderScore < requiredScore) {
        return {
          isValid: false,
          reason: "Votre niveau de vérification est insuffisant pour envoyer des messages",
          requiredScore,
          currentScore: senderScore
        };
      }

      if (recipientScore < 50) {
        return {
          isValid: false,
          reason: "Le destinataire doit compléter sa vérification pour recevoir des messages",
          requiredScore: 50,
          currentScore: recipientScore
        };
      }

      // Check if both users have email verification
      if (!senderVerification[0]?.email_verified || !recipientVerification[0]?.email_verified) {
        return {
          isValid: false,
          reason: "Vérification email requise pour tous les participants"
        };
      }

      return { isValid: true, currentScore: senderScore, requiredScore };
    } catch (error) {
      console.error('Message permission validation failed:', error);
      return { isValid: false, reason: "Erreur de validation des permissions" };
    }
  };

  const validateProfileAccessEnhanced = async (
    targetUserId: string,
    requiredScore: number = 85
  ): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: "Utilisateur non authentifié" };
    }

    // Self-access is always allowed
    if (user.id === targetUserId) {
      return { isValid: true };
    }

    try {
      const { data: verification, error: verificationError } = await supabase
        .rpc('get_user_verification_status_secure', { target_user_id: user.id });

      if (verificationError) throw verificationError;

      const userVerification = verification[0];
      if (!userVerification) {
        return {
          isValid: false,
          reason: "Données de vérification non trouvées"
        };
      }

      // Check hourly profile view limits based on verification level
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentViews, error: viewsError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewer_id', user.id)
        .gte('created_at', hourAgo);

      if (viewsError) throw viewsError;

      const hourlyLimit = userVerification.verification_score >= 70 ? 15 : 5;
      if (recentViews.length >= hourlyLimit) {
        return {
          isValid: false,
          reason: `Limite horaire de consultation de profils atteinte (${hourlyLimit}). Vérifiez votre compte pour plus d'accès.`,
          additionalInfo: { hourly_limit: hourlyLimit, current_count: recentViews.length }
        };
      }

      const currentScore = userVerification.verification_score || 0;
      if (currentScore < requiredScore) {
        return {
          isValid: false,
          reason: "Niveau de vérification insuffisant pour consulter ce profil",
          requiredScore,
          currentScore
        };
      }

      return { isValid: true, currentScore, requiredScore };
    } catch (error) {
      console.error('Profile access validation failed:', error);
      return { isValid: false, reason: "Erreur de validation d'accès" };
    }
  };

  const validateContactInfoAccess = async (familyMemberId: string): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: "Utilisateur non authentifié" };
    }

    try {
      // Check if user can access contact info through secure function
      const { data: contactAccess, error: contactError } = await supabase
        .rpc('get_family_contact_secure', { family_member_uuid: familyMemberId });

      if (contactError) {
        // Log the access attempt
        await logSecurityEvent(
          'family_contact_access_denied',
          'high',
          'Tentative d\'accès aux informations de contact familiales refusée',
          {
            family_member_id: familyMemberId,
            error: contactError.message,
            attempted_by: user.id
          }
        );

        return {
          isValid: false,
          reason: "Accès aux informations de contact non autorisé. Vérification d'identité requise."
        };
      }

      if (!contactAccess || contactAccess.length === 0) {
        return {
          isValid: false,
          reason: "Aucune information de contact disponible ou accessible"
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Contact info access validation failed:', error);
      return { isValid: false, reason: "Erreur de validation d'accès aux contacts" };
    }
  };

  const showValidationError = (result: ValidationResult) => {
    let description = result.reason || "Validation échouée";
    
    if (result.requiredScore && result.currentScore !== undefined) {
      description += ` (Score requis: ${result.requiredScore}, votre score: ${result.currentScore})`;
    }

    toast({
      title: "Accès refusé",
      description,
      variant: "destructive",
      duration: 8000
    });
  };

  const validateWithFeedback = async (
    validationFn: () => Promise<ValidationResult>
  ): Promise<boolean> => {
    setValidating(true);
    try {
      const result = await validationFn();
      
      if (result.isValid) {
        toast({
          title: "Validation réussie",
          description: "Opération autorisée",
          variant: "default",
          duration: 3000
        });
        return true;
      } else {
        showValidationError(result);
        return false;
      }
    } catch (error) {
      toast({
        title: "Erreur de validation",
        description: "Une erreur est survenue lors de la validation",
        variant: "destructive"
      });
      return false;
    } finally {
      setValidating(false);
    }
  };

  return {
    validateFamilyOperationEnhanced,
    validateMessagePermissionsEnhanced,
    validateProfileAccessEnhanced,
    validateContactInfoAccess,
    validateWithFeedback,
    showValidationError,
    validating
  };
};