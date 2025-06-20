
import { useParams } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import { useUserSession } from '@/hooks/useUserSession';
import { useDemoMessages } from '@/hooks/useDemoMessages';
import DemoConversation from '@/components/messaging/demo/DemoConversation';
import RegularConversation from '@/components/messaging/regular/RegularConversation';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  
  // Use refs to prevent re-renders
  const initialRenderDone = useRef(false);
  const prevConversationId = useRef(conversationId);
  const prevErrorRef = useRef<string | null>(null);
  const toastShownRef = useRef(false);
  
  // Get current user session
  const { currentUserId, loading: userLoading } = useUserSession();
  
  // Handle demo conversation detection and messages
  const { isDemoConversation, demoMessages, setDemoMessages } = useDemoMessages(conversationId);
  
  // Get user profile data
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Use messages hook with stable parameters
  const messagesHookResult = useMessages(conversationId, currentUserId);
  
  // Destructure with safe defaults
  const {
    conversations = [],
    currentConversation = null,
    messages = [],
    loading = false,
    sendingMessage = false,
    errors = { conversations: null, messages: null, videoCall: null, monitoring: null },
    messageInput = "",
    setMessageInput = () => {},
    videoCallStatus = { isActive: false, waliPresent: false },
    sendMessage = () => Promise.resolve(),
    startVideoCall = () => {},
    endVideoCall = () => {},
    violations = [],
    latestReport = null,
    monitoringEnabled = false,
    toggleMonitoring = () => {},
    monitoringLoading = false,
    encryptionEnabled = false,
    toggleEncryption = () => {},
    retentionPolicy = {},
    updateRetentionPolicy = () => {}
  } = messagesHookResult || {};

  // Debug logs - only when conversation changes
  useEffect(() => {
    const conversationChanged = prevConversationId.current !== conversationId;
    
    if (conversationChanged) {
      prevConversationId.current = conversationId;
      
      if (!loading && !userLoading && !initialRenderDone.current) {
        initialRenderDone.current = true;
        console.log("Messages component initialized with conversation:", conversationId);
      }
    }
  }, [conversationId, loading, userLoading]);

  // Handle errors - only show once per unique error with proper safety checks
  useEffect(() => {
    // Safely access the messages error
    const currentError = errors?.messages || null;
    
    if (currentError && 
        currentError !== prevErrorRef.current && 
        !toastShownRef.current) {
      
      console.error("Message error:", currentError);
      prevErrorRef.current = currentError;
      toastShownRef.current = true;
      
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: currentError
      });
      
      // Reset toast flag after a delay
      setTimeout(() => {
        toastShownRef.current = false;
      }, 5000);
    } else if (!currentError) {
      // Reset refs when error is cleared
      prevErrorRef.current = null;
      toastShownRef.current = false;
    }
  }, [errors?.messages, toast]);

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
        currentUserId={currentUserId || 'current-user'}
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
