
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import ChatWindow from '@/components/messaging/ChatWindow';
import VideoCallManager from '@/components/messaging/VideoCallManager';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { userId, formData } = useProfileData();
  
  const {
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
  } = useMessages(conversationId, userId);

  // Select a conversation
  const selectConversation = (conversation: { id: string }) => {
    navigate(`/messages/${conversation.id}`);
  };

  if (!userId) {
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
        conversations={conversations}
        conversationId={conversationId}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
      >
        {videoCallStatus.isActive ? (
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
              currentUserId={userId}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              onStartVideoCall={() => {
                const otherUserId = currentConversation.participants.find(id => id !== userId);
                if (otherUserId) {
                  startVideoCall(otherUserId);
                }
              }}
              backToList={() => navigate('/messages')}
              isWaliSupervised={currentConversation.wali_supervised}
            />
          )
        )}
      </MessagesContainer>
    </div>
  );
};

export default Messages;
