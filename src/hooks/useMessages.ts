
import { useConversations } from './useConversations';
import { useMessageExchange } from './useMessageExchange';
import { useVideoCall } from './useVideoCall';
import { useAIMonitoring } from './useAIMonitoring';
import { useNavigate } from 'react-router-dom';
import { initializeMessageCleanup } from '@/services/messageLifecycleService';
import { useEffect } from 'react';
import { RetentionPolicy } from '@/types/profile';

export const useMessages = (conversationId: string | undefined, userId: string | null) => {
  const navigate = useNavigate();
  
  // Initialize message cleanup on component mount
  useEffect(() => {
    initializeMessageCleanup();
  }, []);
  
  // Use the specialized hooks
  const { 
    conversations, 
    currentConversation, 
    loading: conversationsLoading,
    error: conversationsError,
    loadCurrentConversation
  } = useConversations(userId);
  
  const {
    messages,
    messageInput,
    setMessageInput,
    sendMessage: sendMessageBase,
    loading: messagesLoading,
    sendingMessage,
    error: messagesError,
    encryptionEnabled,
    toggleEncryption,
    retentionPolicy,
    updateRetentionPolicy
  } = useMessageExchange(conversationId, userId);
  
  const {
    videoCallStatus,
    startVideoCall,
    endVideoCall,
    error: videoCallError
  } = useVideoCall(userId, conversationId);
  
  const {
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading: monitoringLoading,
    error: monitoringError
  } = useAIMonitoring(conversationId, messages, userId);

  // Loading state combines loading states from all hooks
  const loading = conversationsLoading || messagesLoading || monitoringLoading;
  
  // Combine errors
  const errors = {
    conversations: conversationsError,
    messages: messagesError,
    videoCall: videoCallError,
    monitoring: monitoringError
  };

  // Load current conversation if conversationId changes
  if (conversationId && !currentConversation) {
    loadCurrentConversation(conversationId);
  }

  // Wrapper for sendMessage
  const sendMessage = () => {
    if (conversationId) {
      sendMessageBase();
    }
  };

  // Wrapper for updating retention policy
  const updateRetentionSettings = (policy: RetentionPolicy) => {
    if (updateRetentionPolicy) {
      updateRetentionPolicy(policy);
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    sendingMessage,
    errors,
    messageInput,
    setMessageInput,
    videoCallStatus,
    sendMessage,
    startVideoCall,
    endVideoCall,
    // AI monitoring states
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    // Encryption and retention states
    encryptionEnabled,
    toggleEncryption,
    retentionPolicy,
    updateRetentionPolicy: updateRetentionSettings
  };
};
