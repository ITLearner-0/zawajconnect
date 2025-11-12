import { Conversation, VideoCallStatus, RetentionPolicy } from '@/types/profile';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import VideoCallManager from '@/components/messaging/VideoCallManager';
import ChatWindow from '@/components/messaging/ChatWindow';

interface MessagingInterfaceProps {
  loading: boolean;
  conversations: Conversation[];
  selectedConversationId?: string;
  currentConversation: Conversation | null;
  selectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  messages: any[];
  messageInput: string;
  setMessageInput: (input: string) => void;
  sendMessage: () => void;
  sendingMessage: boolean;
  videoCallStatus: VideoCallStatus;
  endVideoCall: () => void;
  startVideoCall: (participantId: string) => void;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  encryptionEnabled: boolean;
  toggleEncryption: (enabled: boolean) => void;
  retentionPolicy: RetentionPolicy;
  updateRetentionPolicy: (policy: RetentionPolicy) => void;
}

const MessagingInterface = ({
  loading,
  conversations,
  selectedConversationId,
  currentConversation,
  selectConversation,
  currentUserId,
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  sendingMessage,
  videoCallStatus,
  endVideoCall,
  startVideoCall,
  monitoringEnabled,
  toggleMonitoring,
  encryptionEnabled,
  toggleEncryption,
  retentionPolicy,
  updateRetentionPolicy,
}: MessagingInterfaceProps) => {
  // Function to handle returning to conversation list
  const handleBackToList = () => {
    // We need to pass an object with the correct conversation shape but with empty ID
    const emptyConversation: Conversation = {
      id: '',
      created_at: new Date().toISOString(),
      participants: [],
      wali_supervised: false,
    };
    selectConversation(emptyConversation);
  };

  // Function to handle starting a video call
  const handleStartVideoCall = () => {
    if (!currentConversation) return;

    const otherUserId = currentConversation.participants.find((id) => id !== currentUserId);
    if (otherUserId) {
      console.log('Starting video call with participant:', otherUserId);
      startVideoCall(otherUserId);
    }
  };

  return (
    <div className="h-[600px] border border-islamic-teal/20 dark:border-islamic-darkTeal/30 rounded-lg overflow-hidden bg-islamic-solidGreen/5 dark:bg-islamic-darkGreen/10">
      <MessagesContainer
        loading={loading}
        conversations={conversations}
        conversationId={selectedConversationId}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        errors={{
          conversations: null,
          messages: null,
          videoCall: null,
        }}
      >
        {videoCallStatus.isActive ? (
          <VideoCallManager
            videoCallStatus={videoCallStatus}
            onEndCall={endVideoCall}
            conversationId={selectedConversationId}
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
              error={null}
              onStartVideoCall={handleStartVideoCall}
              backToList={handleBackToList}
              isWaliSupervised={currentConversation.wali_supervised}
              monitoringEnabled={monitoringEnabled}
              toggleMonitoring={toggleMonitoring}
              encryptionEnabled={encryptionEnabled}
              toggleEncryption={toggleEncryption}
              retentionPolicy={retentionPolicy}
              updateRetentionPolicy={updateRetentionPolicy}
            />
          )
        )}
      </MessagesContainer>
    </div>
  );
};

export default MessagingInterface;
