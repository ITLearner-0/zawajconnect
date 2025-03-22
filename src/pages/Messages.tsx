
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import ChatWindow from '@/components/messaging/ChatWindow';
import VideoCallManager from '@/components/messaging/VideoCallManager';
import { Toaster } from '@/components/ui/toaster';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { dummyProfiles } from '@/data/profiles';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDemoConversation, setIsDemoConversation] = useState(false);
  
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    };
    
    getUserId();
    
    // Check if this is a demo conversation (user-X format)
    if (conversationId && conversationId.startsWith('user-')) {
      setIsDemoConversation(true);
      console.log('Demo conversation detected:', conversationId);
    }
  }, [conversationId]);
  
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Use conversationId directly from useParams
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

  // Debug logs
  useEffect(() => {
    console.log("Current conversation ID:", conversationId);
    console.log("Current user ID:", currentUserId);
    if (errors.messages) {
      console.error("Message error:", errors.messages);
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: errors.messages
      });
    }
  }, [conversationId, currentUserId, errors.messages]);

  // Handle demo conversation for profiles with user-X IDs
  useEffect(() => {
    if (isDemoConversation && !currentConversation && conversationId) {
      // Find the demo profile
      const demoProfile = dummyProfiles.find(p => p.id === conversationId);
      if (demoProfile) {
        console.log("Found demo profile:", demoProfile.first_name);
        // Display some UI or message for the demo conversation
        toast({
          title: "Demo Conversation",
          description: `Starting demo conversation with ${demoProfile.first_name}`
        });
      } else {
        console.error("Demo profile not found:", conversationId);
      }
    }
  }, [isDemoConversation, currentConversation, conversationId]);

  // Select a conversation
  const selectConversation = (conversation: { id: string }) => {
    navigate(`/messages/${conversation.id}`);
  };

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to view messages</p>
      </div>
    );
  }

  // Handle demo profiles case
  if (isDemoConversation && conversationId) {
    const demoProfile = dummyProfiles.find(p => p.id === conversationId);
    
    if (demoProfile) {
      return (
        <div className="flex flex-col h-screen">
          <div className="bg-primary text-white p-4">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          
          <div className="flex-1 p-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-islamic-blue">Demo Conversation with {demoProfile.first_name}</h2>
                <p className="text-muted-foreground mt-2">
                  This is a demo conversation with {demoProfile.first_name} {demoProfile.last_name}.
                </p>
              </div>
              
              <div className="bg-accent/10 p-4 rounded-md mb-6">
                <p className="text-center">
                  To send a message to {demoProfile.gender === 'Female' ? 'her' : 'him'}, please use the button on {demoProfile.first_name}'s profile to submit a request to {demoProfile.gender === 'Female' ? 'her wali' : 'start a conversation'}.
                </p>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate(`/profile/${conversationId}`)}
                  className="bg-islamic-teal hover:bg-islamic-teal/80 text-white px-6 py-2 rounded-md"
                >
                  Return to Profile
                </button>
              </div>
            </div>
          </div>
          
          <Toaster />
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      
      <MessagesContainer
        loading={loading}
        conversations={conversations || []}
        conversationId={conversationId}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        errors={{
          conversations: errors?.conversations || null,
          messages: errors?.messages || null,
          videoCall: errors?.videoCall || null,
          monitoring: errors?.monitoring || null
        }}
      >
        {videoCallStatus?.isActive ? (
          <VideoCallManager
            videoCallStatus={videoCallStatus}
            onEndCall={endVideoCall}
            conversationId={conversationId}
          />
        ) : (
          currentConversation && (
            <ChatWindow
              conversation={currentConversation}
              messages={messages}
              currentUserId={currentUserId}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              loading={loading}
              sendingMessage={sendingMessage}
              error={errors?.messages || null}
              onStartVideoCall={() => {
                const otherUserId = currentConversation.participants.find(id => id !== currentUserId);
                if (otherUserId) {
                  startVideoCall(otherUserId);
                }
              }}
              backToList={() => navigate('/messages')}
              isWaliSupervised={currentConversation.wali_supervised}
              report={latestReport}
              monitoringEnabled={monitoringEnabled}
              toggleMonitoring={toggleMonitoring}
              monitoringLoading={monitoringLoading}
              // Encryption and retention props
              encryptionEnabled={encryptionEnabled}
              toggleEncryption={toggleEncryption}
              retentionPolicy={retentionPolicy}
              updateRetentionPolicy={updateRetentionPolicy}
            />
          )
        )}
      </MessagesContainer>
      
      <Toaster />
    </div>
  );
};

export default Messages;
