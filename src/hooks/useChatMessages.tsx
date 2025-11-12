import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  family_member_id?: string;
  is_family_supervised?: boolean;
}

export const useChatMessages = (matchId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!matchId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(
        (data || []).map((msg) => ({
          ...msg,
          is_read: msg.is_read ?? false,
          family_member_id: msg.family_member_id ?? undefined,
          is_family_supervised: msg.is_family_supervised ?? false,
        }))
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [matchId, toast]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!matchId || !user) return;

    // Cleanup existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if not sent by current user
          if (newMessage.sender_id !== user.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [matchId, user]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const markAllMessagesAsRead = useCallback(async () => {
    if (!user || !matchId) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user, matchId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !matchId || !content.trim()) return false;

      setSending(true);

      try {
        const { error } = await supabase.from('messages').insert({
          match_id: matchId,
          sender_id: user.id,
          content: content.trim(),
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Erreur',
          description: "Impossible d'envoyer le message",
          variant: 'destructive',
        });
        return false;
      } finally {
        setSending(false);
      }
    },
    [user, matchId, toast]
  );

  useEffect(() => {
    if (matchId) {
      fetchMessages();
      setupRealtimeSubscription();
      markAllMessagesAsRead();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [matchId, fetchMessages, setupRealtimeSubscription, markAllMessagesAsRead]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markMessageAsRead,
    refetch: fetchMessages,
  };
};
