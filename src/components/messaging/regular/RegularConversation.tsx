
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
    conversations?: string | null;
    messages?: string | null;
    videoCall?: string | null;
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
  conversations = [],
  currentConversation,
  messages = [],
  loading = false,
  sendingMessage = false,
  errors = {},
  messageInput = "",
  setMessageInput,
  videoCallStatus = {},
  sendMessage,
  startVideoCall,
  endVideoCall,
  latestReport = null,
  monitoringEnabled = false,
  toggleMonitoring = () => {},
  monitoringLoading = false,
  encryptionEnabled = false,
  toggleEncryption = () => {},
  retentionPolicy = {},
  updateRetentionPolicy = () => {}
}) => {
  const navigate = useNavigate();

  // Select a conversation
  const selectConversation = (conversation: { id: string }) => {
    navigate(`/messages/${conversation.id}`);
  };

  // Make sure errors object has all required fields
  const normalizedErrors = {
    conversations: errors?.conversations || null,
    messages: errors?.messages || null,
    videoCall: errors?.videoCall || null,
    monitoring: errors?.monitoring || null
  };

  // Check if currentConversation is valid before rendering ChatWindow
  const isValidConversation = currentConversation && typeof currentConversation === 'object';

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
        errors={normalizedErrors}
      >
        {videoCallStatus?.isActive ? (
          <VideoCallManager
            videoCallStatus={videoCallStatus}
            onEndCall={endVideoCall}
            conversationId={conversationId}
          />
        ) : (
          isValidConversation ? (
            <ChatWindow
              conversation={currentConversation}
              messages={messages}
              currentUserId={currentUserId}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              loading={loading}
              sendingMessage={sendingMessage}
              error={normalizedErrors.messages}
              onStartVideoCall={() => {
                const otherUserId = currentConversation.participants?.find(id => id !== currentUserId);
                if (otherUserId) {
                  startVideoCall(otherUserId);
                }
              }}
              backToList={() => navigate('/messages')}
              isWaliSupervised={currentConversation.wali_supervised || false}
              report={latestReport}
              monitoringEnabled={monitoringEnabled}
              toggleMonitoring={toggleMonitoring}
              monitoringLoading={monitoringLoading}
              encryptionEnabled={encryptionEnabled}
              toggleEncryption={toggleEncryption}
              retentionPolicy={retentionPolicy}
              updateRetentionPolicy={updateRetentionPolicy}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a conversation</p>
            </div>
          )
        )}
      </MessagesContainer>
      
      <Toaster />
    </div>
  );
};

export default RegularConversation;
