
import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import ReportDialog from './ReportDialog';
import ChatBody from './chat/ChatBody';
import { useChatControls } from './chat/useChatControls';
import { useChatMessageHandler } from './chat/ChatMessageHandler';
import { useMessageModeration } from '@/hooks/useMessageModeration';
import { useAIMonitoring } from '@/hooks/useAIMonitoring';

interface ChatContainerProps {
  conversationId: string;
  userId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage?: string;
  messages: any[];
  onSendMessage: (content: string) => void;
  onStartVideoCall: () => void;
  isWaliSupervised?: boolean;
  isSupervisor?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  conversationId,
  userId,
  otherUserId,
  otherUserName,
  otherUserImage,
  messages,
  onSendMessage,
  onStartVideoCall,
  isWaliSupervised = false,
  isSupervisor = false
}) => {
  const [messageInput, setMessageInput] = useState("");
  
  // Use our custom hooks
  const { 
    showRetentionSettings,
    showSecuritySettings,
    showMonitoring,
    showReportDialog,
    showEmergencyPanel,
    setShowReportDialog,
    toggleRetentionSettings,
    toggleSecuritySettings,
    toggleMonitoringPanel,
    toggleEmergencyPanel
  } = useChatControls();
  
  const { 
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading: monitoringLoading,
    error: monitoringError
  } = useAIMonitoring(conversationId);
  
  const { 
    moderateMessageContent, 
    processContentFlags 
  } = useMessageModeration(conversationId, messages, userId);

  // Initialize message handler using the hook
  const { handleSendMessage } = useChatMessageHandler({
    conversationId,
    onSendMessage,
    moderateMessageContent,
    processContentFlags
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-islamic-darkCard">
      <ChatHeader 
        conversation={{
          id: conversationId,
          profile: { first_name: otherUserName, last_name: '' },
          participants: [userId, otherUserId],
          created_at: new Date().toISOString(),
          wali_supervised: isWaliSupervised
        }}
        currentUserId={userId}
        backToList={() => {}}
        onStartVideoCall={onStartVideoCall}
        isWaliSupervised={isWaliSupervised}
        showSecuritySettings={showSecuritySettings}
        setShowSecuritySettings={toggleSecuritySettings}
        openReportDialog={() => setShowReportDialog(true)}
      />
      
      <ChatBody 
        messages={messages}
        currentUserId={userId}
        conversationId={conversationId}
        isWaliSupervised={isWaliSupervised}
        onReportMessage={() => setShowReportDialog(true)}
        showRetentionSettings={showRetentionSettings}
        showSecuritySettings={showSecuritySettings}
        showMonitoring={showMonitoring}
        showEmergencyPanel={showEmergencyPanel}
        otherUserId={otherUserId}
        latestReport={latestReport}
        monitoringEnabled={monitoringEnabled}
        toggleMonitoring={toggleMonitoring}
        monitoringLoading={monitoringLoading}
        monitoringError={monitoringError}
        onCloseMonitoring={() => toggleMonitoringPanel()}
      />
      
      <MessageInput 
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={() => {
          if (messageInput.trim()) {
            handleSendMessage(messageInput);
            setMessageInput("");
          }
        }}
        sendingMessage={false}
        encryptionEnabled={true}
      />
      
      <ReportDialog 
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        userId={otherUserId}
        messageId={undefined}
        conversationId={conversationId}
        currentUserId={userId}
      />
    </div>
  );
};

export default ChatContainer;
