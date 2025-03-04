
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';
import { useToast } from './use-toast';

export const useMessageHandling = (conversationId?: string, currentUserId?: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [errors, setErrors] = useState<{ messages: string | null }>({
    messages: null
  });

  // Helper function for message decryption (placeholder - would be implemented in a real app)
  const decryptMessage = async (message: Message): Promise<Message> => {
    // In a real app, this would decrypt the message
    return { ...message, content: message.content };
  };

  // Fetch messages for the current conversation
  const fetchMessages = useCallback(async (encryptionEnabled: boolean) => {
    if (!conversationId || !currentUserId) return;
    
    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, messages: null }));
      
      console.log('Fetching messages for conversation:', conversationId);
      
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
        setErrors(prev => ({
          ...prev,
          messages: `Failed to load messages: ${error.message}`
        }));
        return;
      }
      
      // Process messages for encryption if needed
      let processedMessages: Message[] = data || [];
      
      if (encryptionEnabled && processedMessages.length > 0) {
        processedMessages = await Promise.all(
          processedMessages.map(msg => 
            msg.encrypted ? decryptMessage(msg) : msg
          )
        );
      }
      
      setMessages(processedMessages);
      
      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(
          msg => !msg.is_read && msg.sender_id !== currentUserId
        );
        
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(msg => msg.id);
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
      console.error('Error in fetchMessages:', err);
      setErrors(prev => ({
        ...prev,
        messages: `An unexpected error occurred: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUserId]);

  // Send a message
  const sendMessage = async () => {
    if (!messageInput.trim() || !conversationId || !currentUserId) return;
    
    try {
      setSendingMessage(true);
      
      // Create a new message
      const newMessage = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: messageInput,
        created_at: new Date().toISOString(),
        is_read: false,
        is_wali_visible: true
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      // Clear input and refresh messages
      setMessageInput('');
      fetchMessages(false); // Assuming no encryption when sending new message
    } catch (err: any) {
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive"
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
    sendMessage
  };
};
