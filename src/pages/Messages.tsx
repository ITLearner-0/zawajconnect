
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import { useUserSession } from '@/hooks/useUserSession';
import { useDemoMessages } from '@/hooks/useDemoMessages';
import { useSecurity } from '@/components/security/SecurityProvider';
import DemoConversation from '@/components/messaging/demo/DemoConversation';
import RegularConversation from '@/components/messaging/regular/RegularConversation';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  
  // Use refs to prevent re-renders
  const initialRenderDone = useRef(false);
  const prevConversationId = useRef(conversationId);
  const prevErrorRef = useRef<string | null>(null);
  const toastShownRef = useRef(false);
  
  // State for actual conversation ID
  const [actualConversationId, setActualConversationId] = useState<string | undefined>(conversationId);
  const [isResolvingConversation, setIsResolvingConversation] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  
  // Get current user session
  const { currentUserId, loading: userLoading } = useUserSession();
  
  // Handle demo conversation detection and messages
  const { isDemoConversation, demoMessages, setDemoMessages } = useDemoMessages(actualConversationId);
  
  // Get user profile data
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Use messages hook with stable parameters
  const messagesHookResult = useMessages(actualConversationId, currentUserId);
  
  // Destructure with safe defaults and proper error handling
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

  // Function to find or create conversation
  const findOrCreateConversation = async (otherUserId: string) => {
    if (!currentUserId || !otherUserId) {
      console.error("Missing user IDs:", { currentUserId, otherUserId });
      return null;
    }
    
    console.log("Finding or creating conversation between:", currentUserId, "and", otherUserId);
    setIsResolvingConversation(true);
    setResolveError(null);
    
    try {
      // First, try to find existing conversation
      console.log("Searching for existing conversations...");
      const { data: existingConversations, error: findError} = await (supabase as any)
        .from('conversations')
        .select('id, participants')
        .contains('participants', [currentUserId])
        .contains('participants', [otherUserId]);
      
      if (findError) {
        console.error('Error finding conversations:', findError);
        throw new Error(`Failed to search conversations: ${findError.message}`);
      }
      
      console.log("Found conversations:", existingConversations);
      
      // Check if we found a conversation with exactly these two participants
      const existingConv = existingConversations?.find((conv: any) => 
        conv.participants?.length === 2 && 
        conv.participants?.includes(currentUserId) && 
        conv.participants?.includes(otherUserId)
      );
      
      if (existingConv) {
        console.log('Found existing conversation:', existingConv.id);
        return existingConv.id;
      }
      
      // Create new conversation
      console.log("Creating new conversation...");
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participants: [currentUserId, otherUserId],
          wali_supervised: false
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating conversation:', createError);
        throw new Error(`Failed to create conversation: ${createError.message}`);
      }
      
      console.log('Created new conversation:', newConversation.id);
      return newConversation.id;
      
    } catch (error: any) {
      console.error('Error in findOrCreateConversation:', error);
      const errorMessage = error.message || "Failed to load conversation";
      setResolveError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
      return null;
    } finally {
      setIsResolvingConversation(false);
    }
  };

  // Effect to resolve conversation ID if it's actually a user ID
  useEffect(() => {
    const resolveConversationId = async () => {
      if (!conversationId || !currentUserId || userLoading) {
        console.log("Skipping resolution:", { conversationId, currentUserId, userLoading });
        return;
      }
      
      console.log("Resolving conversation ID:", conversationId);
      
      // Check if this looks like a user ID (UUID format) rather than a conversation ID
      const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId);
      
      if (isUuidFormat && conversationId !== currentUserId) {
        console.log("This appears to be a user ID, resolving to conversation...");
        // This might be a user ID, try to find or create conversation
        const resolvedConvId = await findOrCreateConversation(conversationId);
        if (resolvedConvId && resolvedConvId !== conversationId) {
          console.log("Resolved to conversation ID:", resolvedConvId, "updating URL...");
          // Update the URL to use the actual conversation ID
          navigate(`/messages/${resolvedConvId}`, { replace: true });
          setActualConversationId(resolvedConvId);
        } else if (resolvedConvId) {
          console.log("Using resolved conversation ID:", resolvedConvId);
          setActualConversationId(resolvedConvId);
        } else {
          console.error("Failed to resolve conversation ID");
          // Don't set actualConversationId to maintain loading state
        }
      } else {
        console.log("Using conversation ID as-is:", conversationId);
        // Use the ID as-is (could be a demo conversation or actual conversation ID)
        setActualConversationId(conversationId);
      }
    };
    
    resolveConversationId();
  }, [conversationId, currentUserId, userLoading, navigate]);

  // Debug logs - only when conversation changes
  useEffect(() => {
    const conversationChanged = prevConversationId.current !== actualConversationId;
    
    if (conversationChanged) {
      prevConversationId.current = actualConversationId;
      
      if (!loading && !userLoading && !initialRenderDone.current) {
        initialRenderDone.current = true;
        console.log("Messages component initialized with conversation:", actualConversationId);
      }
    }
  }, [actualConversationId, loading, userLoading]);

  // Handle errors - only show once per unique error with proper safety checks
  useEffect(() => {
    // Safely access the messages error
    const currentError = errors?.messages || resolveError || null;
    
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
  }, [errors?.messages, resolveError, toast]);

  // Loading state
  if (userLoading || isResolvingConversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 dark:border-rose-300 mx-auto"></div>
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
            {isResolvingConversation ? "Setting up conversation..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (resolveError && !isResolvingConversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {resolveError}
          </p>
          <button 
            onClick={() => navigate('/messages')}
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate conversation interface based on type
  if (isDemoConversation && actualConversationId) {
    return (
      <DemoConversation
        conversationId={actualConversationId}
        currentUserId={currentUserId || 'current-user'}
        demoMessages={demoMessages}
        setDemoMessages={setDemoMessages}
      />
    );
  }

  return (
    <RegularConversation
      conversationId={actualConversationId}
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
