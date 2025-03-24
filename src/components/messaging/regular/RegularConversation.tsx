
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import ChatWindow from '@/components/messaging/ChatWindow';
import VideoCallManager from '@/components/messaging/VideoCallManager';
import { Toaster } from '@/components/ui/toaster';

interface RegularConversationProps {
  conversationId?: string;
  currentUserId: string;
  conversations: any[];
  currentConversation: any;
  messages: any[];
  loading: boolean;
  sendingMessage: boolean;
  errors: {
    conversations: string | null;
    messages: string | null;
    videoCall: string | null;
    monitoring?: string | null;
  };
  messageInput: string;
  setMessageInput: (value: string) => void;
  videoCallStatus: any;
  sendMessage: () => void;
  startVideoCall: (otherUserId: string) => void;
  endVideoCall: () => void;
  latestReport: any;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  monitoringLoading: boolean;
  encryptionEnabled: boolean;
  toggleEncryption: (value: boolean) => void;
  retentionPolicy: any;
  updateRetentionPolicy: (policy: any) => void;
}

const RegularConversation: React.FC<RegularConversationProps> = ({
  conversationId,
  currentUserId,
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
  latestReport,
  monitoringEnabled,
  toggleMonitoring,
  monitoringLoading,
  encryptionEnabled,
  toggleEncryption,
  retentionPolicy,
  updateRetentionPolicy
}) => {
  const navigate = useNavigate();

  // Select a conversation
  const selectConversation = (conversation: { id: string }) => {
    navigate(`/messages/${conversation.id}`);
  };

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

export default RegularConversation;
