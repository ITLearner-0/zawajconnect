
import { useState } from 'react';
import { Conversation } from '@/types/profile';
import { useConversations } from './useConversations';
import { useMessageHandling } from './useMessageHandling';
import { useMessageModeration } from './useMessageModeration';
import { useMessageEncryption } from './useMessageEncryption';
import { useMessageRetention } from './useMessageRetention';
import { useAIMonitoring } from './useAIMonitoring';
import { useVideoCall } from './useVideoCall';

export const useMessagesCore = (conversationId?: string, currentUserId?: string | null) => {
  const [errors, setErrors] = useState<{ 
    conversations: string | null; 
    videoCall: string | null; 
    monitoring?: string | null 
  }>({
    conversations: null,
    videoCall: null,
    monitoring: null
  });

  // Import all required hooks
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

  // Update errors from different parts
  if (conversationsError) {
    setErrors(prev => ({ ...prev, conversations: conversationsError }));
  }

  // Combine and integrate the functionality
  const sendMessage = async () => {
    await sendMessageBase();
  };

  return {
    // Conversations
    conversations,
    currentConversation,
    loadCurrentConversation,
    
    // Messages
    messages,
    loading,
    fetchMessages: () => fetchMessages(encryptionEnabled),
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
