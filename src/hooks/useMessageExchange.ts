
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { useMessageModeration } from './useMessageModeration';

export const useMessageExchange = (conversationId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user directly from supabase session
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get moderation functions
  const { 
    violations, 
    latestReport, 
    monitoringEnabled, 
    toggleMonitoring, 
    loading: monitoringLoading, 
    error: monitoringError,
    moderateMessageContent,
    processContentFlags 
  } = useMessageModeration(conversationId, messages, userId);

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    };
    
    fetchUser();
    
    // Also set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          setError(error.message);
        } else {
          setMessages(data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to real-time updates
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(prevMessages => [...prevMessages, payload.new as Message]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prevMessages =>
            prevMessages.map(msg => (msg.id === (payload.new as Message).id ? payload.new as Message : msg))
          );
        } else if (payload.eventType === 'DELETE') {
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== (payload.old as Message).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [conversationId]);

  const sendMessage = async (content: string, attachments: string[] = []) => {
    if (!conversationId || !userId || !content.trim()) {
      console.error("Cannot send message: Missing conversation ID, user ID, or content");
      return null;
    }

    try {
      // Check for violations before sending
      const { flags, isFiltered, filteredContent } = moderateMessageContent(content);
      
      // Process any flags that were detected
      if (flags.length > 0) {
        const messageId = Math.random().toString(36).substring(2, 15); // Temp ID for pre-insert flagging
        flags.forEach(flag => {
          processContentFlags(
            messageId, 
            'message', 
            flag.flag_type as 'inappropriate' | 'harassment' | 'religious_violation' | 'suspicious',
            flag.severity as 'low' | 'medium' | 'high'
          );
        });
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: userId,
            content: isFiltered ? filteredContent : content,
            attachments: attachments,
            created_at: new Date().toISOString(),
            is_read: false,
            is_wali_visible: true, // Default value
            content_flags: flags,
            is_filtered: isFiltered
          }
        ])
        .select('*')
        .single();

      if (error) {
        setError(error.message);
        return null;
      }

      return newMessage;
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    monitoringError
  };
};
