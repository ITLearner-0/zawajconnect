import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  MatchRow,
  FamilyMemberRow,
  ProfileViewRow,
  UserVerificationStatus,
  ValidationAdditionalInfo,
  ValidationResult,
  SecurityValidationHook,
} from '@/types/supabase';

export const useSecurityValidationEnhanced = (): SecurityValidationHook => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityEvents();
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);

  /**
   * Valide une opération familiale avec vérification renforcée
   * @param operationType - Type d'opération (invitation, supervision, approval)
   * @param requiredScore - Score de vérification minimum requis (défaut: 80)
   */
  const validateFamilyOperationEnhanced = async (
    operationType: string,
    requiredScore: number = 80
  ): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: 'Utilisateur non authentifié' };
    }

    try {
      // Check user verification status with strict typing
      const { data: verification, error: verificationError } = await supabase.rpc(
        'get_user_verification_status_secure',
        { target_user_id: user.id }
      );

      if (verificationError) {
        await logSecurityEvent(
          'verification_check_failed',
          'medium',
          `Échec de vérification pour opération famille: ${operationType}`,
          { error: verificationError.message, operation_type: operationType }
        );
        throw verificationError;
      }

      // Type guard for RPC response
      const userVerification = (verification as UserVerificationStatus[] | null)?.[0];
      if (!userVerification) {
        return {
          isValid: false,
          reason: 'Données de vérification non trouvées',
          requiredScore,
          currentScore: 0,
        };
      }

      // Enhanced validation based on operation type
      if (operationType === 'invitation' || operationType === 'supervision') {
        if (!userVerification.email_verified) {
          return {
            isValid: false,
            reason: 'Vérification email requise pour les invitations familiales',
            requiredScore,
            currentScore: userVerification.verification_score,
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
        if ((todayInvitations?.length ?? 0) >= dailyLimit) {
          return {
            isValid: false,
            reason: `Limite quotidienne d'invitations atteinte (${dailyLimit}). Vérifiez votre compte pour plus d'invitations.`,
            requiredScore,
            currentScore: userVerification.verification_score,
            additionalInfo: {
              daily_limit: dailyLimit,
              current_count: todayInvitations?.length ?? 0,
            },
          };
        }
      }

      // For high-security operations like 'approval', require ID verification
      if (operationType === 'approval' && !userVerification.id_verified) {
        return {
          isValid: false,
          reason: "Vérification d'identité requise pour les approbations familiales",
          requiredScore,
          currentScore: userVerification.verification_score,
        };
      }

      const currentScore = userVerification.verification_score;
      if (currentScore < requiredScore) {
        return {
          isValid: false,
          reason: `Score de vérification insuffisant pour ${operationType}`,
          requiredScore,
          currentScore,
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
          required_score: requiredScore,
        }
      );

      return { isValid: true, currentScore, requiredScore };
    } catch (err) {
      const error = err as PostgrestError | Error;
      console.error('Family operation validation failed:', error);
      return { isValid: false, reason: 'Erreur de validation' };
    }
  };

  /**
   * Valide les permissions d'envoi de message avec vérification renforcée
   * @param matchId - ID du match
   * @param requiredScore - Score de vérification minimum requis (défaut: 60)
   */
  const validateMessagePermissionsEnhanced = async (
    matchId: string,
    requiredScore: number = 60
  ): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: 'Utilisateur non authentifié' };
    }

    try {
      // Check if user can access this match with strict typing
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
        // Check if user is authorized family member
        const { data: familyAccess, error: familyError } = await supabase.rpc(
          'can_access_match_security_definer',
          {
            match_user1_id: match.user1_id,
            match_user2_id: match.user2_id,
          }
        );

        if (familyError || !familyAccess) {
          await logSecurityEvent(
            'unauthorized_message_attempt',
            'high',
            "Tentative d'envoi de message non autorisée",
            { match_id: matchId, attempted_by: user.id }
          );

          return {
            isValid: false,
            reason: 'Accès non autorisé à cette conversation',
          };
        }
      }

      // Validate both sender and recipient verification
      const senderId = user.id;
      const recipientId = match.user1_id === senderId ? match.user2_id : match.user1_id;

      const { data: senderVerification, error: senderError } = await supabase.rpc(
        'get_user_verification_status_secure',
        { target_user_id: senderId }
      );

      const { data: recipientVerification, error: recipientError } = await supabase.rpc(
        'get_user_verification_status_secure',
        { target_user_id: recipientId }
      );

      if (senderError || recipientError) {
        throw new Error('Erreur de vérification des utilisateurs');
      }

      // Type guard for RPC responses
      const senderStatus = (senderVerification as UserVerificationStatus[] | null)?.[0];
      const recipientStatus = (recipientVerification as UserVerificationStatus[] | null)?.[0];

      const senderScore = senderStatus?.verification_score ?? 0;
      const recipientScore = recipientStatus?.verification_score ?? 0;

      if (senderScore < requiredScore) {
        return {
          isValid: false,
          reason: 'Votre niveau de vérification est insuffisant pour envoyer des messages',
          requiredScore,
          currentScore: senderScore,
        };
      }

      if (recipientScore < 50) {
        return {
          isValid: false,
          reason: 'Le destinataire doit compléter sa vérification pour recevoir des messages',
          requiredScore: 50,
          currentScore: recipientScore,
        };
      }

      // Check if both users have email verification
      if (!senderStatus?.email_verified || !recipientStatus?.email_verified) {
        return {
          isValid: false,
          reason: 'Vérification email requise pour tous les participants',
        };
      }

      return { isValid: true, currentScore: senderScore, requiredScore };
    } catch (err) {
      const error = err as PostgrestError | Error;
      console.error('Message permission validation failed:', error);
      return { isValid: false, reason: 'Erreur de validation des permissions' };
    }
  };

  /**
   * Valide l'accès à un profil avec vérification renforcée
   * @param targetUserId - ID de l'utilisateur cible
   * @param requiredScore - Score de vérification minimum requis (défaut: 85)
   */
  const validateProfileAccessEnhanced = async (
    targetUserId: string,
    requiredScore: number = 85
  ): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: 'Utilisateur non authentifié' };
    }

    // Self-access is always allowed
    if (user.id === targetUserId) {
      return { isValid: true };
    }

    try {
      const { data: verification, error: verificationError } = await supabase.rpc(
        'get_user_verification_status_secure',
        { target_user_id: user.id }
      );

      if (verificationError) throw verificationError;

      // Type guard for RPC response
      const userVerification = (verification as UserVerificationStatus[] | null)?.[0];
      if (!userVerification) {
        return {
          isValid: false,
          reason: 'Données de vérification non trouvées',
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
      if ((recentViews?.length ?? 0) >= hourlyLimit) {
        return {
          isValid: false,
          reason: `Limite horaire de consultation de profils atteinte (${hourlyLimit}). Vérifiez votre compte pour plus d'accès.`,
          additionalInfo: {
            hourly_limit: hourlyLimit,
            current_count: recentViews?.length ?? 0,
          },
        };
      }

      const currentScore = userVerification.verification_score;
      if (currentScore < requiredScore) {
        return {
          isValid: false,
          reason: 'Niveau de vérification insuffisant pour consulter ce profil',
          requiredScore,
          currentScore,
        };
      }

      return { isValid: true, currentScore, requiredScore };
    } catch (err) {
      const error = err as PostgrestError | Error;
      console.error('Profile access validation failed:', error);
      return { isValid: false, reason: "Erreur de validation d'accès" };
    }
  };

  /**
   * Valide l'accès aux informations de contact familiales
   * @param familyMemberId - ID du membre de famille
   */
  const validateContactInfoAccess = async (familyMemberId: string): Promise<ValidationResult> => {
    if (!user) {
      return { isValid: false, reason: 'Utilisateur non authentifié' };
    }

    try {
      // Check if user can access contact info through secure function
      const { data: contactAccess, error: contactError } = await supabase.rpc(
        'get_family_contact_secure',
        { family_member_uuid: familyMemberId }
      );

      if (contactError) {
        // Log the access attempt
        await logSecurityEvent(
          'family_contact_access_denied',
          'high',
          "Tentative d'accès aux informations de contact familiales refusée",
          {
            family_member_id: familyMemberId,
            error: contactError.message,
            attempted_by: user.id,
          }
        );

        return {
          isValid: false,
          reason:
            "Accès aux informations de contact non autorisé. Vérification d'identité requise.",
        };
      }

      if (!contactAccess || (Array.isArray(contactAccess) && contactAccess.length === 0)) {
        return {
          isValid: false,
          reason: 'Aucune information de contact disponible ou accessible',
        };
      }

      return { isValid: true };
    } catch (err) {
      const error = err as PostgrestError | Error;
      console.error('Contact info access validation failed:', error);
      return { isValid: false, reason: "Erreur de validation d'accès aux contacts" };
    }
  };

  /**
   * Affiche une erreur de validation dans un toast
   * @param result - Résultat de validation contenant les détails de l'erreur
   */
  const showValidationError = (result: ValidationResult): void => {
    let description = result.reason ?? 'Validation échouée';

    if (result.requiredScore !== undefined && result.currentScore !== undefined) {
      description += ` (Score requis: ${result.requiredScore}, votre score: ${result.currentScore})`;
    }

    toast({
      title: 'Accès refusé',
      description,
      variant: 'destructive',
      duration: 8000,
    });
  };

  /**
   * Exécute une validation avec feedback utilisateur
   * @param validationFn - Fonction de validation à exécuter
   * @returns true si la validation réussit, false sinon
   */
  const validateWithFeedback = async (
    validationFn: () => Promise<ValidationResult>
  ): Promise<boolean> => {
    setValidating(true);
    try {
      const result = await validationFn();

      if (result.isValid) {
        toast({
          title: 'Validation réussie',
          description: 'Opération autorisée',
          variant: 'default',
          duration: 3000,
        });
        return true;
      } else {
        showValidationError(result);
        return false;
      }
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Erreur de validation',
        description: error.message ?? 'Une erreur est survenue lors de la validation',
        variant: 'destructive',
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
    validating,
  };
};
