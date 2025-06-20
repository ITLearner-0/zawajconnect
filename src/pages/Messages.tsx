
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import { useUserSession } from '@/hooks/useUserSession';
import { useDemoMessages } from '@/hooks/useDemoMessages';
import DemoConversation from '@/components/messaging/demo/DemoConversation';
import RegularConversation from '@/components/messaging/regular/RegularConversation';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
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
    if (!currentUserId || !otherUserId) return null;
    
    setIsResolvingConversation(true);
    
    try {
      // First, try to find existing conversation
      const { data: existingConversations, error: findError } = await supabase
        .from('conversations')
        .select('id, participants')
        .contains('participants', [currentUserId])
        .contains('participants', [otherUserId]);
      
      if (findError) {
        console.error('Error finding conversations:', findError);
        throw findError;
      }
      
      // Check if we found a conversation with exactly these two participants
      const existingConv = existingConversations?.find(conv => 
        conv.participants.length === 2 && 
        conv.participants.includes(currentUserId) && 
        conv.participants.includes(otherUserId)
      );
      
      if (existingConv) {
        console.log('Found existing conversation:', existingConv.id);
        return existingConv.id;
      }
      
      // Create new conversation
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
        throw createError;
      }
      
      console.log('Created new conversation:', newConversation.id);
      return newConversation.id;
      
    } catch (error: any) {
      console.error('Error in findOrCreateConversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation"
      });
      return null;
    } finally {
      setIsResolvingConversation(false);
    }
  };

  // Effect to resolve conversation ID if it's actually a user ID
  useEffect(() => {
    const resolveConversationId = async () => {
      if (!conversationId || !currentUserId || userLoading) return;
      
      // Check if this looks like a user ID (UUID format) rather than a conversation ID
      const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId);
      
      if (isUuidFormat && conversationId !== currentUserId) {
        // This might be a user ID, try to find or create conversation
        const resolvedConvId = await findOrCreateConversation(conversationId);
        if (resolvedConvId && resolvedConvId !== conversationId) {
          // Update the URL to use the actual conversation ID
          navigate(`/messages/${resolvedConvId}`, { replace: true });
          setActualConversationId(resolvedConvId);
        } else {
          setActualConversationId(conversationId);
        }
      } else {
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
  if (userLoading || isResolvingConversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 dark:border-rose-300"></div>
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
