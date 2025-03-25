
import { useParams } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import { useUserSession } from '@/hooks/useUserSession';
import { useDemoMessages } from '@/hooks/useDemoMessages';
import DemoConversation from '@/components/messaging/demo/DemoConversation';
import RegularConversation from '@/components/messaging/regular/RegularConversation';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  
  // Get current user session
  const { currentUserId, loading: userLoading } = useUserSession();
  
  // Handle demo conversation detection and messages
  const { isDemoConversation, demoMessages, setDemoMessages } = useDemoMessages(conversationId);
  
  // Get user profile data
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Use conversationId from useParams for real conversations
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
  } = useMessages(conversationId, currentUserId);

  // Debug logs and error handling
  useEffect(() => {
    console.log("Current conversation ID:", conversationId);
    console.log("Current user ID:", currentUserId);
    console.log("Is demo conversation:", isDemoConversation);
    console.log("Demo messages:", demoMessages);
    
    if (errors?.messages) {
      console.error("Message error:", errors.messages);
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: errors.messages
      });
    }
  }, [conversationId, currentUserId, isDemoConversation, demoMessages, errors?.messages]);

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
    console.log("Rendering demo conversation for:", conversationId);
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
      conversations={conversations}
      currentConversation={currentConversation}
      messages={messages}
      loading={loading}
      sendingMessage={sendingMessage}
      errors={errors}
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
