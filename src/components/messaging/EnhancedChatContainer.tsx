import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import EnhancedMessageInput from './EnhancedMessageInput';
import ReportDialog from './ReportDialog';
import ChatBody from './chat/ChatBody';
import { useChatControls } from './chat/useChatControls';
import { useChatMessageHandler } from './chat/ChatMessageHandler';
import { useMessageModeration } from '@/hooks/useMessageModeration';
import { useAIMonitoring } from '@/hooks/useAIMonitoring';

// Message interfaces
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  encrypted?: boolean;
  is_filtered?: boolean;
  attachments?: string[];
  content_flags?: any;
  is_wali_visible?: boolean;
  scheduled_deletion?: string;
  iv?: string;
}

// Conversation interfaces
export interface Conversation {
  id: string;
  participants: string[];
  wali_supervised: boolean;
  created_at: string;
  encryption_enabled?: boolean;
  retention_policy?: RetentionPolicy;
  last_message?: Message;
  profile?: {
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

// Retention policy
export interface RetentionPolicy {
  type: 'temporary' | 'permanent';
  auto_delete: boolean;
  duration_days?: number;
}

interface IslamicContent {
  id: string;
  type: 'quran' | 'hadith';
  arabic: string;
  translation: string;
  reference: string;
  category?: string;
}

interface CallScheduleData {
  type: 'audio' | 'video';
  date: string;
  time: string;
  duration: number;
  includeWali: boolean;
  notes?: string;
  timezone?: string;
}

interface TemporaryMessageSettings {
  enabled: boolean;
  defaultDuration: number;
  allowCustomDuration: boolean;
  warnBeforeExpiry: boolean;
  warningTime: number;
}

interface EnhancedChatContainerProps {
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

const EnhancedChatContainer = ({
  conversationId,
  userId,
  otherUserId,
  otherUserName,
  otherUserImage,
  messages,
  onSendMessage,
  onStartVideoCall,
  isWaliSupervised = false,
  isSupervisor = false,
}: EnhancedChatContainerProps) => {
  const [messageInput, setMessageInput] = useState('');
  const [temporaryMessageSettings, setTemporaryMessageSettings] =
    useState<TemporaryMessageSettings>({
      enabled: false,
      defaultDuration: 24,
      allowCustomDuration: true,
      warnBeforeExpiry: true,
      warningTime: 30,
    });

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
    toggleEmergencyPanel,
  } = useChatControls();

  const {
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    loading: monitoringLoading,
    error: monitoringError,
  } = useAIMonitoring(conversationId);

  const { moderateMessageContent, processContentFlags } = useMessageModeration(
    conversationId,
    messages,
    userId
  );

  // Initialize message handler using the hook
  const { handleSendMessage } = useChatMessageHandler({
    conversationId,
    onSendMessage,
    moderateMessageContent,
    processContentFlags,
  });

  // Enhanced message handlers
  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      // Convert audio blob to base64 or upload to storage
      const audioData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      // Send voice message with metadata
      const voiceMessage = {
        type: 'voice',
        content: `[Message vocal - ${Math.floor(duration)}s]`,
        audioData,
        duration,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending voice message:', voiceMessage);
      handleSendMessage(`[Voice Message: ${duration}s]`);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  const handleShareIslamicContent = (content: IslamicContent) => {
    const islamicMessage = `📖 ${content.type === 'quran' ? 'Verset' : 'Hadith'} partagé:\n\n${content.arabic}\n\n"${content.translation}"\n\n— ${content.reference}`;
    handleSendMessage(islamicMessage);
  };

  const handleScheduleCall = (scheduleData: CallScheduleData) => {
    const scheduleMessage = `📞 Appel ${scheduleData.type === 'video' ? 'vidéo' : 'audio'} planifié:\n📅 ${scheduleData.date} à ${scheduleData.time}\n⏱️ Durée: ${scheduleData.duration}min${scheduleData.includeWali ? '\n👥 Avec supervision du Wali' : ''}${scheduleData.notes ? `\n📝 Notes: ${scheduleData.notes}` : ''}`;
    handleSendMessage(scheduleMessage);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-islamic-darkCard">
      <ChatHeader
        conversation={{
          id: conversationId,
          profile: { first_name: otherUserName, last_name: '' },
          participants: [userId, otherUserId],
          created_at: new Date().toISOString(),
          wali_supervised: isWaliSupervised,
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

      <EnhancedMessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={() => {
          if (messageInput.trim()) {
            handleSendMessage(messageInput);
            setMessageInput('');
          }
        }}
        sendingMessage={false}
        encryptionEnabled={true}
        otherUserName={otherUserName}
        onSendVoiceMessage={handleSendVoiceMessage}
        onShareIslamicContent={handleShareIslamicContent}
        onScheduleCall={handleScheduleCall}
        isWaliRequired={isWaliSupervised}
        temporaryMessageSettings={temporaryMessageSettings}
        onTemporarySettingsChange={setTemporaryMessageSettings}
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

export default EnhancedChatContainer;
