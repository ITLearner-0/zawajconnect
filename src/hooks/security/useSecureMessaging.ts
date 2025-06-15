
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText, messageValidationSchema, checkForInappropriateContent } from '@/utils/security/enhancedValidation';
import { useEnhancedRateLimit } from './useEnhancedRateLimit';
import { useSecurityAudit } from './useSecurityAudit';
import { toast } from 'sonner';

export const useSecureMessaging = () => {
  const [sending, setSending] = useState(false);
  const { checkRateLimit } = useEnhancedRateLimit();
  const { logMessageSent } = useSecurityAudit();

  const sendSecureMessage = useCallback(async (
    content: string, 
    conversationId: string, 
    senderId: string
  ) => {
    setSending(true);
    
    try {
      // Rate limiting check
      if (!checkRateLimit('message_send')) {
        setSending(false);
        return { success: false, error: 'Rate limit exceeded' };
      }

      // Validate input
      const validationResult = messageValidationSchema.safeParse({
        content,
        conversationId
      });

      if (!validationResult.success) {
        const error = validationResult.error.errors[0]?.message || 'Invalid input';
        logMessageSent(conversationId, false, error);
        toast.error(error);
        setSending(false);
        return { success: false, error };
      }

      // Sanitize content
      const sanitizedContent = sanitizeText(content);

      // Check for inappropriate content
      const contentCheck = checkForInappropriateContent(sanitizedContent);
      if (!contentCheck.isAppropriate) {
        const error = 'Message contains inappropriate content';
        logMessageSent(conversationId, false, error);
        toast.error('Votre message contient du contenu inapproprié');
        setSending(false);
        return { success: false, error };
      }

      // Send message to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: sanitizedContent,
          conversation_id: conversationId,
          sender_id: senderId,
          is_wali_visible: true
        })
        .select()
        .single();

      if (error) {
        logMessageSent(conversationId, false, error.message);
        toast.error('Erreur lors de l\'envoi du message');
        setSending(false);
        return { success: false, error: error.message };
      }

      logMessageSent(conversationId, true);
      setSending(false);
      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logMessageSent(conversationId, false, errorMessage);
      toast.error('Erreur lors de l\'envoi du message');
      setSending(false);
      return { success: false, error: errorMessage };
    }
  }, [checkRateLimit, logMessageSent]);

  return {
    sendSecureMessage,
    sending
  };
};
