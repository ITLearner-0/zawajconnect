import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, RetentionPolicy } from '@/types/profile';
import { useToast } from './use-toast';
import { useConversations } from './useConversations';
import { useMessageUI } from './useMessageUI';
import { useMessageModeration } from './useMessageModeration';
import { useMessageEncryption } from './useMessageEncryption';
import { useMessageRetention } from './useMessageRetention';
import { useAIMonitoring } from './useAIMonitoring';
import { useVideoCall } from './useVideoCall';

export const useMessages = (conversationId?: string, currentUserId?: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ conversations: string | null; messages: string | null; videoCall: string | null; monitoring?: string | null }>({
    conversations: null,
    messages: null,
    videoCall: null,
    monitoring: null,
  });

  // Fetch messages for the current conversation
  const fetchMessages = useCallback(async () => {
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
  }, [conversationId, currentUserId, encryptionEnabled, decryptMessage]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    errors,
    fetchMessages,
  };
};
