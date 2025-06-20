
import { useState, useCallback, useRef } from 'react';
import { Conversation } from '@/types/profile';
import { useConversations } from './useConversations';
import { useMessageHandling } from './useMessageHandling';
import { useMessageModeration } from './useMessageModeration';
import { useMessageEncryption } from './useMessageEncryption';
import { useMessageRetention } from './useMessageRetention';
import { useAIMonitoring } from './useAIMonitoring';
import { useVideoCall } from './useVideoCall';

export const useMessagesCore = (conversationId?: string, currentUserId?: string | null) => {
  // Use refs to track previous values and prevent unnecessary updates
  const prevConversationId = useRef(conversationId);
  const prevCurrentUserId = useRef(currentUserId);
  const errorsRef = useRef<{ 
    conversations: string | null; 
    videoCall: string | null; 
    monitoring?: string | null 
  }>({
    conversations: null,
    videoCall: null,
    monitoring: null
  });

  const [errors, setErrors] = useState(errorsRef.current);

  // Stable function to update errors
  const updateErrors = useCallback((newErrors: Partial<typeof errors>) => {
    const updatedErrors = { ...errorsRef.current, ...newErrors };
    errorsRef.current = updatedErrors;
    setErrors(updatedErrors);
  }, []);

  // Import all required hooks with stable parameters
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation,
    loadCurrentConversation,
    error: conversationsError
  } = useConversations(currentUserId || null);
  
  const { encryptionEnabled, toggleEncryption } = useMessageEncryption(conversationId);
  const { retentionPolicy, updateRetentionPolicy } = useMessageRetention(conversationId);
  const { videoCallStatus, startVideoCall, endVideoCall } = useVideoCall(conversationId, currentUserId);
  const { latestReport, monitoringEnabled, toggleMonitoring, loading: monitoringLoading } = useAIMonitoring(conversationId);
  
  const {
    messages,
    loading,
    errors: messageErrors,
    fetchMessages,
    sendingMessage,
    messageInput,
    setMessageInput,
    sendMessage: sendMessageBase
  } = useMessageHandling(conversationId, currentUserId);

  const { violations } = useMessageModeration(conversationId, messages, currentUserId);

  // Update errors only when they actually change
  if (conversationsError && conversationsError !== errorsRef.current.conversations) {
    updateErrors({ conversations: conversationsError });
  }

  // Stable send message function
  const sendMessage = useCallback(async () => {
    try {
      await sendMessageBase();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [sendMessageBase]);

  // Stable fetch messages function  
  const stableFetchMessages = useCallback(() => {
    return fetchMessages(encryptionEnabled);
  }, [fetchMessages, encryptionEnabled]);

  return {
    // Conversations
    conversations,
    currentConversation,
    loadCurrentConversation,
    
    // Messages
    messages,
    loading,
    fetchMessages: stableFetchMessages,
    sendingMessage,
    messageInput,
    setMessageInput,
    sendMessage,
    
    // Combined errors
    errors: {
      ...errors,
      messages: messageErrors.messages
    },
    
    // Video call
    videoCallStatus,
    startVideoCall,
    endVideoCall,
    
    // AI monitoring
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    
    // Encryption and retention
    encryptionEnabled,
    toggleEncryption,
    retentionPolicy,
    updateRetentionPolicy
  };
};
