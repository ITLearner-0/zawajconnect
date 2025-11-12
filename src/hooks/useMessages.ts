import { useMessagesCore } from './useMessagesCore';
import { useMemo, useRef } from 'react';

export const useMessages = (conversationId?: string, currentUserId?: string | null) => {
  // Use refs to stabilize inputs and prevent excessive re-renders
  const conversationIdRef = useRef(conversationId);
  const currentUserIdRef = useRef(currentUserId);

  // Only update refs when values actually change
  if (conversationIdRef.current !== conversationId) {
    conversationIdRef.current = conversationId;
  }

  if (currentUserIdRef.current !== currentUserId) {
    currentUserIdRef.current = currentUserId;
  }

  // Memoize inputs with stable references
  const stableInputs = useMemo(
    () => ({
      conversationId: conversationIdRef.current,
      currentUserId: currentUserIdRef.current,
    }),
    [conversationIdRef.current, currentUserIdRef.current]
  );

  // Delegate to the core implementation with stabilized inputs
  const messagesData = useMessagesCore(stableInputs.conversationId, stableInputs.currentUserId);

  // Return with defaulted values to prevent undefined issues
  return useMemo(
    () => ({
      ...messagesData,
      conversations: messagesData.conversations || [],
      messages: messagesData.messages || [],
      errors: messagesData.errors || {
        conversations: null,
        messages: null,
        videoCall: null,
        monitoring: null,
      },
      messageInput: messagesData.messageInput || '',
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
    }),
    [messagesData]
  );
};
