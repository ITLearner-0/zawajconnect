
import { useMessagesCore } from './useMessagesCore';

export const useMessages = (conversationId?: string, currentUserId?: string | null) => {
  // Delegate to the core implementation with better error handling
  const messagesData = useMessagesCore(conversationId, currentUserId);
  
  // Return with defaulted values to prevent undefined issues
  return {
    ...messagesData,
    conversations: messagesData.conversations || [],
    messages: messagesData.messages || [],
    errors: messagesData.errors || { conversations: null, messages: null, videoCall: null },
    messageInput: messagesData.messageInput || "",
    loading: messagesData.loading || false,
    sendingMessage: messagesData.sendingMessage || false,
    monitoringEnabled: messagesData.monitoringEnabled || false,
    monitoringLoading: messagesData.monitoringLoading || false,
    encryptionEnabled: messagesData.encryptionEnabled || false,
    retentionPolicy: messagesData.retentionPolicy || {},
    videoCallStatus: messagesData.videoCallStatus || { isActive: false, waliPresent: false },
    sendMessage: messagesData.sendMessage || (() => Promise.resolve()),
    startVideoCall: messagesData.startVideoCall || (() => {}),
    endVideoCall: messagesData.endVideoCall || (() => {}),
    toggleMonitoring: messagesData.toggleMonitoring || (() => {}),
    toggleEncryption: messagesData.toggleEncryption || (() => {}),
    updateRetentionPolicy: messagesData.updateRetentionPolicy || (() => {}),
    violations: messagesData.violations || [],
    latestReport: messagesData.latestReport || null,
    fetchMessages: messagesData.fetchMessages || (() => Promise.resolve()),
    setMessageInput: messagesData.setMessageInput || (() => {}),
  };
};
