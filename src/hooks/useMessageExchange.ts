
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { useMessageModeration } from './useMessageModeration';
import { useToast } from '@/hooks/use-toast';

// Helper function to safely parse content_flags
const parseContentFlags = (flags: any): any[] => {
  if (!flags) return [];
  if (Array.isArray(flags)) return flags;
  if (typeof flags === 'string') {
    try {
      return JSON.parse(flags);
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to convert database message to our Message type
const convertDbMessageToMessage = (dbMessage: any): Message => {
  return {
    ...dbMessage,
    content_flags: parseContentFlags(dbMessage.content_flags)
  };
};

export const useMessageExchange = (conversationId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
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
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          toast({
            title: "Error fetching messages",
            description: fetchError.message,
            variant: "destructive"
          });
        } else {
          // Convert database messages to our Message type
          const convertedMessages = (data || []).map(convertDbMessageToMessage);
          setMessages(convertedMessages);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error fetching messages",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to real-time updates
    const messageSubscription = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
        if (payload.eventType === 'INSERT') {
          const newMessage = convertDbMessageToMessage(payload.new);
          setMessages(prevMessages => [...prevMessages, newMessage]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = convertDbMessageToMessage(payload.new);
          setMessages(prevMessages =>
            prevMessages.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        } else if (payload.eventType === 'DELETE') {
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [conversationId, toast]);

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
          if (flag.flag_type && flag.severity) {
            processContentFlags(
              messageId, 
              'message', 
              flag.flag_type as 'inappropriate' | 'harassment' | 'religious_violation' | 'suspicious',
              flag.severity as 'low' | 'medium' | 'high'
            );
          }
        });
      }

      const { data: newMessage, error: sendError } = await (supabase as any)
        .from('messages')
        .insert([
          {
            match_id: conversationId,
            sender_id: userId,
            content: isFiltered ? filteredContent : content,
            created_at: new Date().toISOString(),
            is_read: false,
            is_wali_visible: true,
            content_flags: flags,
            is_filtered: isFiltered
          }
        ])
        .select('*')
        .single();

      if (sendError) {
        setError(sendError.message);
        toast({
          title: "Error sending message",
          description: sendError.message,
          variant: "destructive"
        });
        return null;
      }

      return convertDbMessageToMessage(newMessage);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
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
    monitoringError: monitoringError || error
  };
};
