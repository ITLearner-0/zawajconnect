
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

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    };
    
    getUserId();
  }, []);
  
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
