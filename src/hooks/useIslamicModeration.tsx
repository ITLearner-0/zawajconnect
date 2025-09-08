import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ModerationResult {
  approved: boolean;
  action: 'approved' | 'blocked' | 'escalated' | 'warned';
  confidence: number;
  rulesTriggered: string[];
  suggestion?: string;
  islamicGuidance?: string;
  reason: string;
}

export interface ModerationSuggestion {
  id: string;
  original_message: string;
  suggested_message: string;
  improvement_reason: string;
  islamic_guidance: string;
  created_at: string;
}

export const useIslamicModeration = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null);

  const moderateContent = async (
    content: string,
    userId: string,
    context?: string,
    matchId?: string
  ): Promise<ModerationResult> => {
    setIsChecking(true);
    
    try {
      console.log('Moderating content:', content);
      
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          content,
          userId,
          matchId,
          context
        }
      });

      if (error) {
        console.error('Moderation error:', error);
        throw error;
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
            break;
          case 'warned':
            toast({
              title: "Attention",
              description: result.reason + (result.islamicGuidance ? `\n\n💡 ${result.islamicGuidance}` : ''),
              variant: "default"
            });
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
      console.error('Error moderating content:', error);
      
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

  const getSuggestions = async (userId: string): Promise<ModerationSuggestion[]> => {
    try {
      const { data, error } = await supabase
        .from('message_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const useSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('message_suggestions')
        .update({ used: true })
        .eq('id', suggestionId);

      if (error) throw error;
      
      toast({
        title: "Suggestion utilisée",
        description: "Merci d'avoir amélioré votre message !",
      });
    } catch (error) {
      console.error('Error marking suggestion as used:', error);
    }
  };

  const getModerationLogs = async (userId: string, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      return [];
    }
  };

  return {
    moderateContent,
    getSuggestions,
    useSuggestion,
    getModerationLogs,
    isChecking,
    lastResult
  };
};