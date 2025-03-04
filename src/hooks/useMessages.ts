
import { useConversations } from './useConversations';
import { useMessageExchange } from './useMessageExchange';
import { useVideoCall } from './useVideoCall';
import { useNavigate } from 'react-router-dom';

export const useMessages = (conversationId: string | undefined, userId: string | null) => {
  const navigate = useNavigate();
  
  // Use the specialized hooks
  const { 
    conversations, 
    currentConversation, 
    loading: conversationsLoading,
    loadCurrentConversation
  } = useConversations(userId);
  
  const {
    messages,
    messageInput,
    setMessageInput,
    sendMessage: sendMessageBase,
    loading: messagesLoading
  } = useMessageExchange(conversationId, userId);
  
  const {
    videoCallStatus,
    startVideoCall,
    endVideoCall
  } = useVideoCall(userId, conversationId);

  // Loading state combines loading states from both hooks
  const loading = conversationsLoading || messagesLoading;

  // Load current conversation if conversationId changes
  if (conversationId && !currentConversation) {
    loadCurrentConversation(conversationId);
  }

  // Wrapper for sendMessage that includes the current conversationId
  const sendMessage = () => {
    if (conversationId) {
      sendMessageBase(conversationId);
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    messageInput,
    setMessageInput,
    videoCallStatus,
    sendMessage,
    startVideoCall,
    endVideoCall
  };
};
