
import { useState, useEffect } from 'react';
import { useConversations } from './useConversations';
import { useMessageExchange } from './useMessageExchange';
import { useVideoCall } from './useVideoCall';
import { useMessageEncryption } from './useMessageEncryption';
import { useMessageRetention } from './useMessageRetention';
import { useMessageUI } from './useMessageUI';
import { Conversation, RetentionPolicy } from '@/types/profile';

export const useMessages = (conversationId: string | undefined, userId: string | undefined) => {
  // Get conversations list
  const { 
    conversations, 
    currentConversation,
    loading: conversationsLoading,
    error: conversationsError
  } = useConversations(userId);
  
  // Get messages exchange logic
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage: sendMessageAPI,
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    monitoringError
  } = useMessageExchange(conversationId);

  // Get UI state
  const {
    messageInput,
    setMessageInput,
    sendingMessage,
    setSendingMessage
  } = useMessageUI();

  // Get encryption utilities
  const {
    encryptionEnabled,
    toggleEncryption
  } = useMessageEncryption(conversationId);

  // Get retention utilities
  const {
    retentionPolicy,
    updateRetentionPolicy
  } = useMessageRetention(conversationId);

  // Get video call functionality
  const {
    videoCallStatus,
    startVideoCall,
    endVideoCall
  } = useVideoCall(userId || '', conversationId);

  // Combined loading state
  const loading = conversationsLoading || messagesLoading;

  // Combined error state
  const errors = {
    conversations: conversationsError,
    messages: messagesError,
    monitoring: monitoringError
  };

  // Handle sending messages
  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    
    setSendingMessage(true);
    try {
      const message = await sendMessageAPI(messageInput);
      if (message) {
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    // Conversations data
    conversations,
    currentConversation,
    
    // Messages data
    messages,
    
    // UI state
    loading,
    errors,
    messageInput,
    setMessageInput,
    sendingMessage,
    
    // Message actions
    sendMessage,
    
    // Video call
    videoCallStatus,
    startVideoCall,
    endVideoCall,
    
    // Content monitoring
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    
    // Encryption
    encryptionEnabled,
    toggleEncryption,
    
    // Retention
    retentionPolicy,
    updateRetentionPolicy
  };
};
