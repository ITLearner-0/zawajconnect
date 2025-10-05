import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useConversationStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const checkIfInConversation = useCallback(async (userId?: string): Promise<boolean> => {
    if (!userId && !user) return false;
    
    try {
      const targetUserId = userId || user?.id;
      const { data, error } = await supabase.rpc('is_user_in_active_conversation' as any, {
        check_user_id: targetUserId
      });
      
      if (error) throw error;
      return Boolean(data);
    } catch (error) {
      console.error('Error checking conversation status:', error);
      return false;
    }
  }, [user]);

  const endConversation = useCallback(async (
    matchId: string,
    reason: string,
    details: string,
    courtesyMessage?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      // 1. Récupérer les informations du match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id, conversation_status')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      if ((matchData as any).conversation_status === 'ended') {
        toast({
          title: "Conversation déjà terminée",
          description: "Cette conversation a déjà été clôturée.",
          variant: "destructive"
        });
        return false;
      }

      const otherUserId = (matchData as any).user1_id === user.id ? (matchData as any).user2_id : (matchData as any).user1_id;

      // 2. Message islamique automatique
      const islamicMessage = "🤲 Qu'Allah vous guide vers ce qui est meilleur pour vous et facilite votre chemin vers un mariage béni. Que cette recherche sincère soit acceptée et que vous trouviez la quiétude du cœur. Ameen.";

      const fullMessage = courtesyMessage 
        ? `${courtesyMessage}\n\n${islamicMessage}`
        : islamicMessage;

      // 3. Mettre à jour le match
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          conversation_status: 'ended',
          conversation_ended_at: new Date().toISOString(),
          ended_by: user.id,
          end_reason: reason,
          end_message: fullMessage
        } as any)
        .eq('id', matchId);

      if (updateError) throw updateError;

      // 4. Ajouter dans blocked_match_pairs pour empêcher les re-matchs
      const { error: blockError } = await supabase
        .from('blocked_match_pairs' as any)
        .insert({
          user1_id: (matchData as any).user1_id,
          user2_id: (matchData as any).user2_id,
          original_match_id: matchId,
          end_reason: reason
        });

      if (blockError && !blockError.message.includes('unique_blocked_pair')) {
        throw blockError;
      }

      // 5. Créer une notification pour l'autre utilisateur
      await supabase.rpc('create_notification', {
        target_user_id: otherUserId,
        notification_type: 'conversation_ended',
        notification_title: 'Conversation terminée',
        notification_content: fullMessage,
        sender_user_id: user.id,
        match_id: matchId
      });

      toast({
        title: "Conversation terminée",
        description: "L'échange a été clôturé avec respect. Vous pouvez maintenant chercher de nouveaux profils.",
      });

      return true;
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la conversation. Veuillez réessayer.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const hasPreviousConversation = useCallback(async (
    userId1: string,
    userId2: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_previous_conversation' as any, {
        u1_id: userId1,
        u2_id: userId2
      });
      
      if (error) throw error;
      return Boolean(data);
    } catch (error) {
      console.error('Error checking previous conversation:', error);
      return false;
    }
  }, []);

  return {
    checkIfInConversation,
    endConversation,
    hasPreviousConversation,
    loading
  };
};
