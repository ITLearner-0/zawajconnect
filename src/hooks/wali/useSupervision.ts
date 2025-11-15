import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, RetentionPolicy } from '@/types/profile';
import { useToast } from '../use-toast';

export interface SupervisionSession {
  id: string;
  conversation_id: string;
  wali_id: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  supervision_level: 'active' | 'passive' | 'minimal';
}

interface SupervisedConversation extends Conversation {
  supervisionId: string;
  supervisionStarted: string;
  supervisionLevel: 'active' | 'passive' | 'minimal';
}

// Helper function to safely parse retention policy
const parseRetentionPolicy = (policy: any): RetentionPolicy | undefined => {
  if (!policy) return undefined;
  if (typeof policy === 'object' && policy.type) {
    return policy as RetentionPolicy;
  }
  return undefined;
};

export const useSupervision = (waliId: string) => {
  const [activeConversations, setActiveConversations] = useState<SupervisedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock function to simulate supervision sessions since the table doesn't exist
  const mockSupervisionSessions: SupervisionSession[] = [];

  // Fetch active supervised conversations - using mock data since supervision_sessions table doesn't exist
  const fetchActiveConversations = useCallback(async () => {
    if (!waliId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Since supervision_sessions table doesn't exist, we'll use a simpler approach
      // We'll just fetch conversations that are marked as wali_supervised
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(
          `
          *,
          profiles:profiles(*)
        `
        )
        .eq('wali_supervised', true);

      if (conversationsError) {
        throw conversationsError;
      }

      // Convert to supervised conversations with mock supervision data
      const supervisedConversations = (conversations || []).map((conversation: any) => ({
        ...conversation,
        supervisionId: `mock-${conversation.id}`,
        supervisionStarted: conversation.created_at || new Date().toISOString(),
        supervisionLevel: 'passive' as const,
        retention_policy: parseRetentionPolicy(conversation.retention_policy),
      })) as any;

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

    if (!waliId) {
      return undefined;
    }

    const channel = supabase
      .channel(`wali_supervision_${waliId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `wali_supervised=eq.true`,
        },
        () => {
          fetchActiveConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [waliId, fetchActiveConversations]);

  // Start supervising a conversation
  const startSupervision = async (
    conversationId: string,
    level: 'active' | 'passive' | 'minimal' = 'passive'
  ) => {
    if (!waliId) return false;

    try {
      // Update the conversation to mark it as wali-supervised
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ wali_supervised: true })
        .eq('id', conversationId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Supervision Started',
        description: `You are now supervising this conversation (${level} mode)`,
        variant: 'default',
      });

      // Refresh the list
      fetchActiveConversations();

      return true;
    } catch (err: any) {
      console.error('Error starting supervision:', err);

      toast({
        title: 'Supervision Failed',
        description: err.message || 'Could not start supervision',
        variant: 'destructive',
      });

      return false;
    }
  };

  // End supervision for a conversation
  const endSupervision = async (supervisionId: string, conversationId: string) => {
    if (!waliId) return false;

    try {
      // Update conversation to mark it as not supervised
      const { error: convError } = await supabase
        .from('conversations')
        .update({ wali_supervised: false })
        .eq('id', conversationId);

      if (convError) {
        throw convError;
      }

      toast({
        title: 'Supervision Ended',
        description: 'You are no longer supervising this conversation',
        variant: 'default',
      });

      // Update local state
      setActiveConversations((prev) => prev.filter((conv) => conv.supervisionId !== supervisionId));

      return true;
    } catch (err: any) {
      console.error('Error ending supervision:', err);

      toast({
        title: 'Action Failed',
        description: err.message || 'Could not end supervision',
        variant: 'destructive',
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
    refreshSupervisions: fetchActiveConversations,
  };
};
