
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
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [errors, setErrors] = useState<{ 
    conversations: string | null; 
    messages: string | null; 
    videoCall: string | null; 
    monitoring?: string | null 
  }>({
    conversations: null,
    messages: null,
    videoCall: null,
    monitoring: null,
  });

  // Import all required hooks
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation,
    loadCurrentConversation 
  } = useConversations(currentUserId || null);
  
  const { encryptionEnabled, toggleEncryption } = useMessageEncryption(conversationId);
  const { retentionPolicy, updateRetentionPolicy } = useMessageRetention(conversationId);
  const { videoCallStatus, startVideoCall, endVideoCall } = useVideoCall(conversationId);
  const { latestReport, monitoringEnabled, toggleMonitoring, loading: monitoringLoading } = useAIMonitoring(conversationId);
  const { violations } = useMessageModeration(conversationId, messages, currentUserId);

  // Helper function for message decryption (placeholder - would be implemented in a real app)
  const decryptMessage = async (message: Message): Promise<Message> => {
    // In a real app, this would decrypt the message
    return { ...message, content: message.content };
  };

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
  }, [conversationId, currentUserId, encryptionEnabled]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Load the current conversation when conversationId changes
  useEffect(() => {
    if (conversationId && currentUserId) {
      loadCurrentConversation(conversationId);
    }
  }, [conversationId, currentUserId, loadCurrentConversation]);

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
      fetchMessages();
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
    // Return all required properties
    messages,
    loading,
    errors,
    fetchMessages,
    sendingMessage,
    messageInput,
    setMessageInput,
    sendMessage,
    conversations,
    currentConversation,
    videoCallStatus,
    startVideoCall,
    endVideoCall,
    // AI monitoring properties
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    // Encryption and retention properties
    encryptionEnabled,
    toggleEncryption,
    retentionPolicy,
    updateRetentionPolicy
  };
};
