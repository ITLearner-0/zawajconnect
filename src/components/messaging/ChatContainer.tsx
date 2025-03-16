
import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import SecuritySettingsPanel from './SecuritySettingsPanel';
import RetentionSettings from './RetentionSettings';
import AIMonitoringDashboard from './AIMonitoringDashboard';
import ReportDialog from './ReportDialog';
import WaliSupervisor from './WaliSupervisor';
import EmergencyPanel from './EmergencyPanel';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Video } from 'lucide-react';
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
  const { toast } = useToast();
  const [showRetentionSettings, setShowRetentionSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  
  const { 
    latestReport,
    monitoringEnabled,
    toggleMonitoring: toggleAIMonitoring,
    loading: monitoringLoading,
    error: monitoringError
  } = useAIMonitoring(conversationId);
  
  const { 
    moderateMessageContent, 
    processContentFlags 
  } = useMessageModeration(conversationId, messages, userId);

  const handleSendMessage = (content: string) => {
    // Apply content moderation
    const { flags, filteredContent, isFiltered } = moderateMessageContent(content);
    
    // If the content was filtered, show a toast
    if (isFiltered) {
      toast({
        title: "Message Modified",
        description: "Your message contained inappropriate content and was modified before sending.",
        variant: "default"
      });
      
      // Process content flags
      flags.forEach(flag => {
        if (flag.flag_type && flag.severity && userId) {
          processContentFlags(
            conversationId, 
            'message',
            flag.flag_type as any,
            flag.severity as any
          );
        }
      });
      
      // Send the filtered content
      onSendMessage(filteredContent);
    } else {
      // Send the original content
      onSendMessage(content);
    }
  };
  
  const toggleRetentionSettings = () => {
    setShowRetentionSettings(!showRetentionSettings);
    // Close other panels
    if (!showRetentionSettings) {
      setShowSecuritySettings(false);
      setShowMonitoring(false);
      setShowEmergencyPanel(false);
    }
  };
  
  const toggleSecuritySettings = () => {
    setShowSecuritySettings(!showSecuritySettings);
    // Close other panels
    if (!showSecuritySettings) {
      setShowRetentionSettings(false);
      setShowMonitoring(false);
      setShowEmergencyPanel(false);
    }
  };
  
  const toggleMonitoringPanel = () => {
    setShowMonitoring(!showMonitoring);
    // Close other panels
    if (!showMonitoring) {
      setShowRetentionSettings(false);
      setShowSecuritySettings(false);
      setShowEmergencyPanel(false);
    }
  };
  
  const toggleEmergencyPanel = () => {
    setShowEmergencyPanel(!showEmergencyPanel);
    // Close other panels
    if (!showEmergencyPanel) {
      setShowRetentionSettings(false);
      setShowSecuritySettings(false);
      setShowMonitoring(false);
    }
  };

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
        setShowSecuritySettings={setShowSecuritySettings}
        openReportDialog={() => setShowReportDialog(true)}
      />
      
      {isWaliSupervised && <WaliSupervisor conversationId={conversationId} />}
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {showRetentionSettings && (
          <RetentionSettings 
            conversationId={conversationId} 
            currentPolicy={{
              type: 'permanent',
              auto_delete: false
            }}
            onPolicyChanged={() => {}}
          />
        )}
        
        {showSecuritySettings && (
          <SecuritySettingsPanel 
            encryptionEnabled={true}
            toggleEncryption={() => {}}
          />
        )}
        
        {showMonitoring && (
          <AIMonitoringDashboard
            report={latestReport}
            isEnabled={monitoringEnabled}
            onToggleMonitoring={toggleAIMonitoring}
            isLoading={monitoringLoading}
            error={monitoringError}
            onClose={() => setShowMonitoring(false)}
          />
        )}
        
        {showEmergencyPanel && (
          <EmergencyPanel
            conversationId={conversationId}
            userId={userId}
            otherUserId={otherUserId}
          />
        )}
        
        <MessagesList 
          messages={messages}
          currentUserId={userId}
          onReportMessage={() => setShowReportDialog(true)}
          isWaliSupervised={isWaliSupervised}
          conversationId={conversationId}
          loading={false}
          error={null}
        />
      </div>
      
      <MessageInput 
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={() => handleSendMessage(messageInput)}
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
