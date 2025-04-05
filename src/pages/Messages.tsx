
import { useParams } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import { useUserSession } from '@/hooks/useUserSession';
import { useDemoMessages } from '@/hooks/useDemoMessages';
import DemoConversation from '@/components/messaging/demo/DemoConversation';
import RegularConversation from '@/components/messaging/regular/RegularConversation';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useMemo } from 'react';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  
  // Use ref to track initial render and prevent excessive logging
  const initialRenderDone = useRef(false);
  
  // Get current user session
  const { currentUserId, loading: userLoading } = useUserSession();
  
  // Handle demo conversation detection and messages - memoize to prevent re-renders
  const { isDemoConversation, demoMessages, setDemoMessages } = useDemoMessages(conversationId);
  
  // Get user profile data
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Use conversationId from useParams for real conversations - memoize options to prevent re-renders
  const messagesOptions = useMemo(() => ({
    conversationId,
    currentUserId
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

  // Debug logs and error handling - only log on first render or when key values change
  useEffect(() => {
    if (!initialRenderDone.current && !loading && !userLoading) {
      // Set ref to true to prevent future logs unless errors change
      initialRenderDone.current = true;
      
      // Only log once to prevent console spam
      console.log("Current conversation ID:", conversationId);
      console.log("Current user ID:", currentUserId);
      console.log("Is demo conversation:", isDemoConversation);
    }
    
    // Log errors separately so they're always reported
    if (errors?.messages) {
      console.error("Message error:", errors.messages);
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: errors.messages
      });
    }
  }, [conversationId, currentUserId, isDemoConversation, errors?.messages, loading, userLoading]);

  // Loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-teal"></div>
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
