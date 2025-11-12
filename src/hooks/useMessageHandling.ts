import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { useToast } from './use-toast';
import { dummyMessages } from '@/data/messages';

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
    content_flags: parseContentFlags(dbMessage.content_flags),
  };
};

export const useMessageHandling = (conversationId?: string, currentUserId?: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [errors, setErrors] = useState<{ messages: string | null }>({
    messages: null,
  });

  // Helper function for message decryption (placeholder - would be implemented in a real app)
  const decryptMessage = async (message: Message): Promise<Message> => {
    // In a real app, this would decrypt the message
    return { ...message, content: message.content };
  };

  // Fetch messages for the current conversation
  const fetchMessages = useCallback(
    async (encryptionEnabled: boolean) => {
      if (!conversationId) return;

      try {
        setLoading(true);
        setErrors((prev) => ({ ...prev, messages: null }));

        console.log('Fetching messages for conversation:', conversationId);

        // Check if this is a demo conversation
        if (conversationId.startsWith('user-') || conversationId.startsWith('conv-')) {
          // Get demo messages
          let demoConvId = conversationId;
          if (conversationId.startsWith('user-')) {
            const userNumber = conversationId.split('-')[1];
            demoConvId = `conv-${userNumber}`;
          }

          if (dummyMessages[demoConvId]) {
            console.log('Using demo messages for:', demoConvId);
            setMessages(dummyMessages[demoConvId]);
          } else {
            console.log('No demo messages found for:', demoConvId);
            setMessages([]);
          }
          setLoading(false);
          return;
        }

        // For real conversations, fetch from Supabase
        try {
          // Create a messages relationship to conversations if it doesn't exist
          const { error: checkError } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conversationId)
            .limit(1);

          if (checkError) {
            console.error('Error checking messages:', checkError);
          }

          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching messages:', error);
            setErrors((prev) => ({
              ...prev,
              messages: `Failed to load messages: ${error.message}`,
            }));
            return;
          }

          // Process messages for encryption if needed
          let processedMessages: Message[] = (data || []).map(convertDbMessageToMessage);

          if (encryptionEnabled && processedMessages.length > 0) {
            processedMessages = await Promise.all(
              processedMessages.map((msg) => (msg.encrypted ? decryptMessage(msg) : msg))
            );
          }

          setMessages(processedMessages);

          // Mark messages as read
          if (data && data.length > 0 && currentUserId) {
            const unreadMessages = data.filter(
              (msg) => !msg.is_read && msg.sender_id !== currentUserId
            );

            if (unreadMessages.length > 0) {
              const unreadIds = unreadMessages.map((msg) => msg.id);
              const { error: updateError } = await supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', unreadIds);

              if (updateError) {
                console.error('Error marking messages as read:', updateError);
              }
            }
          }
        } catch (err: any) {
          console.error('Supabase operation error:', err);
          setErrors((prev) => ({
            ...prev,
            messages: `Database operation failed: ${err.message}`,
          }));
        }
      } catch (err: any) {
        console.error('Error in fetchMessages:', err);
        setErrors((prev) => ({
          ...prev,
          messages: `An unexpected error occurred: ${err.message}`,
        }));
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUserId]
  );

  // Send a message
  const sendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return;

    try {
      setSendingMessage(true);

      // Check if this is a demo conversation
      if (conversationId.startsWith('user-') || conversationId.startsWith('conv-')) {
        // For demo conversations, just add the message locally
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: currentUserId || 'current-user',
          content: messageInput,
          created_at: new Date().toISOString(),
          is_read: false,
          is_wali_visible: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setMessageInput('');
        setSendingMessage(false);
        return;
      }

      // For real conversations, send to Supabase
      if (!currentUserId) {
        throw new Error('You must be logged in to send messages');
      }

      // Create a new message
      const newMessage = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: messageInput,
        created_at: new Date().toISOString(),
        is_read: false,
        is_wali_visible: true,
      };

      const { error } = await supabase.from('messages').insert(newMessage);

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Clear input and refresh messages
      setMessageInput('');
      fetchMessages(false); // Assuming no encryption when sending new message
    } catch (err: any) {
      toast({
        title: 'Failed to send message',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    messages,
    loading,
    errors,
    fetchMessages,
    sendingMessage,
    messageInput,
    setMessageInput,
    sendMessage,
    decryptMessage,
  };
};
