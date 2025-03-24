
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupervisionSession } from '@/types/wali';
import { Conversation } from '@/types/profile';
import { useToast } from '../use-toast';

interface SupervisedConversation extends Conversation {
  supervisionId: string;
  supervisionStarted: string;
  supervisionLevel: 'active' | 'passive' | 'minimal';
}

export const useSupervision = (waliId: string) => {
  const [activeConversations, setActiveConversations] = useState<SupervisedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch active supervised conversations
  const fetchActiveConversations = useCallback(async () => {
    if (!waliId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get active supervision sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('supervision_sessions')
        .select('*')
        .eq('wali_id', waliId)
        .eq('is_active', true);

      if (sessionsError) {
        throw sessionsError;
      }

      if (!sessions.length) {
        setActiveConversations([]);
        setLoading(false);
        return;
      }

      // Get conversation details for each active session
      const conversationIds = sessions.map(session => session.conversation_id);
      
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles:profiles(*)
        `)
        .in('id', conversationIds);

      if (conversationsError) {
        throw conversationsError;
      }

      // Combine the data
      const supervisedConversations = conversations.map(conversation => {
        const session = sessions.find(s => s.conversation_id === conversation.id);
        return {
          ...conversation,
          supervisionId: session?.id || '',
          supervisionStarted: session?.started_at || '',
          supervisionLevel: session?.supervision_level || 'passive'
        } as SupervisedConversation;
      });

      setActiveConversations(supervisedConversations);
    } catch (err: any) {
      console.error('Error fetching active supervisions:', err);
      setError(err.message || 'Failed to load supervised conversations');
    } finally {
      setLoading(false);
    }
  }, [waliId]);

  useEffect(() => {
    fetchActiveConversations();

    // Set up real-time subscription for supervision sessions
    if (waliId) {
      const channel = supabase
        .channel(`wali_supervision_${waliId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'supervision_sessions',
          filter: `wali_id=eq.${waliId}`
        }, () => {
          fetchActiveConversations();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [waliId, fetchActiveConversations]);

  // Start supervising a conversation
  const startSupervision = async (conversationId: string, level: 'active' | 'passive' | 'minimal' = 'passive') => {
    if (!waliId) return false;

    try {
      // Check if already supervising this conversation
      const { data: existing, error: checkError } = await supabase
        .from('supervision_sessions')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('wali_id', waliId)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existing) {
        toast({
          title: "Already Supervising",
          description: "You are already supervising this conversation",
          variant: "default"
        });
        return true;
      }

      // Create new supervision session
      const { error: createError } = await supabase
        .from('supervision_sessions')
        .insert({
          conversation_id: conversationId,
          wali_id: waliId,
          started_at: new Date().toISOString(),
          is_active: true,
          supervision_level: level
        });

      if (createError) {
        throw createError;
      }

      // Update the conversation to mark it as wali-supervised
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ wali_supervised: true })
        .eq('id', conversationId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Supervision Started",
        description: `You are now supervising this conversation (${level} mode)`,
        variant: "default"
      });

      // Refresh the list
      fetchActiveConversations();

      return true;
    } catch (err: any) {
      console.error('Error starting supervision:', err);
      
      toast({
        title: "Supervision Failed",
        description: err.message || "Could not start supervision",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // End supervision for a conversation
  const endSupervision = async (supervisionId: string, conversationId: string) => {
    if (!waliId) return false;

    try {
      // End the supervision session
      const { error: updateError } = await supabase
        .from('supervision_sessions')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', supervisionId)
        .eq('wali_id', waliId);

      if (updateError) {
        throw updateError;
      }

      // Check if there are any other active sessions for this conversation
      const { data: otherSessions, error: checkError } = await supabase
        .from('supervision_sessions')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_active', true);

      if (checkError) {
        throw checkError;
      }

      // If no other active sessions, update conversation
      if (!otherSessions.length) {
        const { error: convError } = await supabase
          .from('conversations')
          .update({ wali_supervised: false })
          .eq('id', conversationId);

        if (convError) {
          throw convError;
        }
      }

      toast({
        title: "Supervision Ended",
        description: "You are no longer supervising this conversation",
        variant: "default"
      });

      // Update local state
      setActiveConversations(prev => 
        prev.filter(conv => conv.supervisionId !== supervisionId)
      );

      return true;
    } catch (err: any) {
      console.error('Error ending supervision:', err);
      
      toast({
        title: "Action Failed",
        description: err.message || "Could not end supervision",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    activeConversations,
    loading,
    error,
    startSupervision,
    endSupervision,
    refreshSupervisions: fetchActiveConversations
  };
};
