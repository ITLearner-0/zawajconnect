import { useState, useCallback, useRef, useEffect } from 'react';
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
    messages: string | null;
    videoCall: string | null;
    monitoring: string | null;
  }>({
    conversations: null,
    messages: null,
    videoCall: null,
    monitoring: null,
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
    loading: conversationsLoading,
    error: conversationsError,
  } = useConversations(currentUserId || null);

  const { encryptionEnabled, toggleEncryption } = useMessageEncryption(conversationId);
  const { retentionPolicy, updateRetentionPolicy } = useMessageRetention(conversationId);
  const { videoCallStatus, startVideoCall, endVideoCall } = useVideoCall(
    conversationId,
    currentUserId
  );
  const {
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading: monitoringLoading,
    error: monitoringError,
  } = useAIMonitoring(conversationId);

  const {
    messages,
    loading: messagesLoading,
    errors: messageErrors,
    fetchMessages,
    sendingMessage,
    messageInput,
    setMessageInput,
    sendMessage: sendMessageBase,
  } = useMessageHandling(conversationId, currentUserId);

  const { violations } = useMessageModeration(conversationId, messages, currentUserId ?? null);

  // Load current conversation when conversationId changes
  useEffect(() => {
    if (conversationId && conversationId !== prevConversationId.current) {
      prevConversationId.current = conversationId;
      loadCurrentConversation(conversationId);
    }
  }, [conversationId, loadCurrentConversation]);

  // Update errors only when they actually change
  useEffect(() => {
    if (conversationsError && conversationsError !== errorsRef.current.conversations) {
      updateErrors({ conversations: conversationsError });
    }
  }, [conversationsError, updateErrors]);

  // Update monitoring errors
  useEffect(() => {
    if (monitoringError && monitoringError !== errorsRef.current.monitoring) {
      updateErrors({ monitoring: monitoringError });
    }
  }, [monitoringError, updateErrors]);

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

  // Combine loading states
  const loading = conversationsLoading || messagesLoading;

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

    // Combined errors with proper typing
    errors: {
      conversations: errorsRef.current.conversations,
      messages: messageErrors.messages,
      videoCall: errorsRef.current.videoCall,
      monitoring: errorsRef.current.monitoring,
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
    updateRetentionPolicy,
  };
};
