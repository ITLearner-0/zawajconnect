
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
  updateRetentionPolicy
}: MessagingInterfaceProps) => {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <MessagesContainer
        loading={loading}
        conversations={conversations}
        conversationId={selectedConversationId}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        errors={{
          conversations: null,
          messages: null,
          videoCall: null
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
              onStartVideoCall={() => {
                const otherUserId = currentConversation.participants.find(id => id !== currentUserId);
                if (otherUserId) {
                  startVideoCall(otherUserId);
                }
              }}
              backToList={() => selectConversation({ ...currentConversation, id: '' })}
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
