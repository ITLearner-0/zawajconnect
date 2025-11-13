
import React, { useState, useRef } from 'react';
import { Conversation, Message, RetentionPolicy } from '@/types/profile';
import ChatHeader from './ChatHeader';
import SecuritySettingsPanel from './SecuritySettingsPanel';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import ReportDialog from './ReportDialog';
import { MonitoringReport } from '@/services/monitoring';
import { useUserStatus } from '@/hooks/useUserStatus';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  onStartVideoCall: () => void;
  backToList: () => void;
  isWaliSupervised?: boolean;
  report?: MonitoringReport | null;
  monitoringEnabled?: boolean;
  toggleMonitoring?: () => void;
  monitoringLoading?: boolean;
  encryptionEnabled?: boolean;
  toggleEncryption?: (enabled: boolean) => void;
  retentionPolicy?: RetentionPolicy;
  updateRetentionPolicy?: (policy: RetentionPolicy) => void;
  userStatus?: 'online' | 'offline' | 'away' | 'busy';
  lastActive?: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages = [],
  currentUserId,
  messageInput = "",
  setMessageInput = () => {},
  sendMessage = () => {},
  loading = false,
  sendingMessage = false,
  error = null,
  onStartVideoCall = () => {},
  backToList = () => {},
  isWaliSupervised = false,
  report = null,
  monitoringEnabled = true,
  toggleMonitoring = () => {},
  monitoringLoading = false,
  encryptionEnabled = true,
  toggleEncryption = () => {},
  retentionPolicy,
  updateRetentionPolicy = () => {},
  userStatus,
  lastActive
}) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const renderCount = useRef(0);
  
  // Get the other user ID to fetch their status
  const otherUserId = conversation?.participants?.find(id => id !== currentUserId) || '';
  
  // Use our hook to get user status if not provided through props
  const userStatusInfo = useUserStatus(otherUserId);
  
  // Use props if available, otherwise use the hook data
  const status = userStatus || userStatusInfo.status;
  const lastActiveTime = lastActive ?? userStatusInfo.lastActive;
  
  const openReportDialog = () => {
    setSelectedMessage(null);
    setIsReportDialogOpen(true);
  };

  const handleReportMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsReportDialogOpen(true);
  };

  renderCount.current += 1;
  console.log(`ChatWindow render #${renderCount.current} for conversation ${conversation?.id}`);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <ChatHeader 
        conversation={conversation}
        currentUserId={currentUserId}
        backToList={backToList}
        onStartVideoCall={onStartVideoCall}
        isWaliSupervised={isWaliSupervised}
        showSecuritySettings={showSecuritySettings}
        setShowSecuritySettings={setShowSecuritySettings}
        openReportDialog={openReportDialog}
        retentionPolicy={retentionPolicy}
        updateRetentionPolicy={updateRetentionPolicy}
        userStatus={status}
        lastActive={lastActiveTime}
      />
      
      {/* Security settings panel (collapsible) */}
      {showSecuritySettings && (
        <SecuritySettingsPanel 
          encryptionEnabled={encryptionEnabled || false}
          toggleEncryption={toggleEncryption || (() => {})}
        />
      )}

      {/* Messages area */}
      <MessagesList 
        messages={messages}
        currentUserId={currentUserId}
        onReportMessage={handleReportMessage}
        isWaliSupervised={isWaliSupervised}
        conversationId={conversation?.id || ''}
        loading={loading}
        error={error}
      />

      {/* Message input */}
      <MessageInput 
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
        sendingMessage={sendingMessage}
        encryptionEnabled={encryptionEnabled || false}
      />

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        userId={otherUserId}
        messageId={selectedMessage?.id}
        conversationId={conversation?.id || ''}
        currentUserId={currentUserId || ''}
      />
    </div>
  );
};

export default ChatWindow;
