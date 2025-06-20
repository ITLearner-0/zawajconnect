
import { useParams } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import { useUserSession } from '@/hooks/useUserSession';
import { useDemoMessages } from '@/hooks/useDemoMessages';
import DemoConversation from '@/components/messaging/demo/DemoConversation';
import RegularConversation from '@/components/messaging/regular/RegularConversation';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useMemo, useCallback } from 'react';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  
  // Use ref to track initial render and prevent excessive logging
  const initialRenderDone = useRef(false);
  const prevConversationId = useRef(conversationId);
  
  // Get current user session
  const { currentUserId, loading: userLoading } = useUserSession();
  
  // Handle demo conversation detection and messages - memoize to prevent re-renders
  const { isDemoConversation, demoMessages, setDemoMessages } = useDemoMessages(conversationId);
  
  // Get user profile data
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Memoize the messages options to prevent re-renders
  const messagesOptions = useMemo(() => ({
    conversationId: conversationId || undefined,
    currentUserId: currentUserId || undefined
  }), [conversationId, currentUserId]);
  
  const {
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
    updateRetentionPolicy
  } = useMessages(messagesOptions.conversationId, messagesOptions.currentUserId);

  // Stable error handler to prevent re-renders
  const handleError = useCallback((error: string) => {
    toast({
      variant: "destructive",
      title: "Error loading messages",
      description: error
    });
  }, [toast]);

  // Debug logs and error handling - only log when necessary
  useEffect(() => {
    const conversationChanged = prevConversationId.current !== conversationId;
    prevConversationId.current = conversationId;
    
    if (!initialRenderDone.current || conversationChanged) {
      if (!loading && !userLoading) {
        initialRenderDone.current = true;
        
        console.log("Current conversation ID:", conversationId);
        console.log("Current user ID:", currentUserId);
        console.log("Is demo conversation:", isDemoConversation);
      }
    }
  }, [conversationId, currentUserId, isDemoConversation, loading, userLoading]);

  // Handle errors separately to prevent render loops
  useEffect(() => {
    if (errors?.messages && errors.messages !== prevConversationId.current) {
      console.error("Message error:", errors.messages);
      handleError(errors.messages);
    }
  }, [errors?.messages, handleError]);

  // Loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 dark:border-rose-300"></div>
      </div>
    );
  }

  // Render the appropriate conversation interface based on type
  if (isDemoConversation && conversationId) {
    return (
      <DemoConversation
        conversationId={conversationId}
        currentUserId={currentUserId || 'current-user'} // Default to 'current-user' for demo
        demoMessages={demoMessages}
        setDemoMessages={setDemoMessages}
      />
    );
  }

  return (
    <RegularConversation
      conversationId={conversationId}
      currentUserId={currentUserId || ''}
      conversations={conversations || []}
      currentConversation={currentConversation}
      messages={messages || []}
      loading={loading}
      sendingMessage={sendingMessage}
      errors={errors || {}}
      messageInput={messageInput}
      setMessageInput={setMessageInput}
      videoCallStatus={videoCallStatus}
      sendMessage={sendMessage}
      startVideoCall={startVideoCall}
      endVideoCall={endVideoCall}
      latestReport={latestReport}
      monitoringEnabled={monitoringEnabled}
      toggleMonitoring={toggleMonitoring}
      monitoringLoading={monitoringLoading}
      encryptionEnabled={encryptionEnabled}
      toggleEncryption={toggleEncryption}
      retentionPolicy={retentionPolicy}
      updateRetentionPolicy={updateRetentionPolicy}
    />
  );
};

export default Messages;
