import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ModerationSuggestion as ModerationSuggestionType } from '@/types/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

// Export pour compatibilité avec composants existants
export type { ModerationSuggestionType as ModerationSuggestion };

/**
 * Résultat de modération retourné par l'edge function
 * Compatible avec le service mais adapté pour l'UI
 */
export interface ModerationResult {
  approved: boolean;
  action: 'approved' | 'blocked' | 'escalated' | 'warned';
  confidence: number;
  rulesTriggered: string[];
  suggestion?: string;
  islamicGuidance?: string;
  reason: string;
}

export const useIslamicModeration = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<ModerationResult | undefined>(undefined);

  const moderateContent = async (
    content: string,
    context?: string,
    matchId?: string
  ): Promise<ModerationResult> => {
    setIsChecking(true);
    
    try {
      console.log('🔒 Moderating content with JWT authentication...');
      
      // Get the current session to extract JWT token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available. Please sign in.');
      }
      
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          content,
          matchId,
          context
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('[useIslamicModeration] Edge function error:', error.message);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from moderation service');
      }

      const result = data as ModerationResult;
      setLastResult(result);
      
      // Show user feedback based on moderation result
      if (!result.approved) {
        switch (result.action) {
          case 'blocked':
            toast({
              title: "Message bloqué",
              description: result.reason,
              variant: "destructive"
            });
            
            // Send email notification for blocked content (server will use JWT user ID)
            try {
              await supabase.functions.invoke('send-moderation-notification-email', {
                body: {
                  action_taken: 'blocked',
                  reason: result.reason,
                  severity: result.confidence > 0.8 ? 'critical' : 'high',
                  details: result.islamicGuidance || result.rulesTriggered.join(', ')
                }
              });
            } catch (emailError) {
              console.error('[useIslamicModeration] Failed to send moderation email:', emailError);
            }
            break;
          case 'warned':
            toast({
              title: "Attention",
              description: result.reason + (result.islamicGuidance ? `\n\n💡 ${result.islamicGuidance}` : ''),
              variant: "default"
            });
            
            // Send email notification for warnings (if confidence is high)
            if (result.confidence > 0.7) {
              try {
                await supabase.functions.invoke('send-moderation-notification-email', {
                  body: {
                    action_taken: 'warned',
                    reason: result.reason,
                    severity: 'medium',
                    details: result.islamicGuidance
                  }
                });
              } catch (emailError) {
                console.error('[useIslamicModeration] Failed to send warning email:', emailError);
              }
            }
            break;
          case 'escalated':
            toast({
              title: "Contenu en révision",
              description: "Votre message sera examiné par un modérateur.",
              variant: "default"
            });
            break;
        }
      }

      return result;
    } catch (error) {
      console.error('[useIslamicModeration] Error moderating content:', error);
      
      // Return safe fallback
      const fallbackResult: ModerationResult = {
        approved: false,
        action: 'escalated',
        confidence: 0.0,
        rulesTriggered: ['system_error'],
        reason: 'Erreur système - contenu escaladé par sécurité'
      };
      
      setLastResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsChecking(false);
    }
  };

  const getSuggestions = async (userId: string): Promise<ModerationSuggestionType[]> => {
    try {
      const { data, error } = await supabase
        .from('message_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        const pgError = error as PostgrestError;
        console.error('[useIslamicModeration] Error fetching suggestions:', pgError.message);
        throw pgError;
      }

      return (data ?? []).map(item => ({
        id: item.id,
        original_message: item.original_message,
        suggested_message: item.suggested_message,
        improvement_reason: item.improvement_reason,
        islamic_guidance: item.islamic_guidance ?? '',
        created_at: item.created_at
      }));
    } catch (error) {
      const pgError = error as PostgrestError;
      console.error('[useIslamicModeration] Error in getSuggestions:', pgError.message);
      return [];
    }
  };

  const applySuggestion = async (suggestionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('message_suggestions')
        .update({ used: true })
        .eq('id', suggestionId);

      if (error) {
        const pgError = error as PostgrestError;
        console.error('[useIslamicModeration] Error updating suggestion:', pgError.message);
        throw pgError;
      }

      toast({
        title: "Suggestion utilisée",
        description: "Merci d'avoir amélioré votre message !",
      });
    } catch (error) {
      const pgError = error as PostgrestError;
      console.error('[useIslamicModeration] Error in applySuggestion:', pgError.message);
    }
  };

  const getModerationLogs = async (userId: string, limit = 10): Promise<unknown[]> => {
    try {
      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        const pgError = error as PostgrestError;
        console.error('[useIslamicModeration] Error fetching logs:', pgError.message);
        throw pgError;
      }

      return data ?? [];
    } catch (error) {
      const pgError = error as PostgrestError;
      console.error('[useIslamicModeration] Error in getModerationLogs:', pgError.message);
      return [];
    }
  };

  return {
    moderateContent,
    getSuggestions,
    applySuggestion,
    getModerationLogs,
    isChecking,
    lastResult
  };
};