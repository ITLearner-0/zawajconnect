import React from 'react';
import MessagesList from '../MessagesList';
import WaliSupervisor from '../WaliSupervisor';
import ChatControlPanel from './ChatControlPanel';
import { MonitoringReport } from '@/services/monitoring';

interface ChatBodyProps {
  messages: any[];
  currentUserId: string;
  conversationId: string;
  isWaliSupervised: boolean;
  onReportMessage: () => void;
  showRetentionSettings: boolean;
  showSecuritySettings: boolean;
  showMonitoring: boolean;
  showEmergencyPanel: boolean;
  otherUserId: string;
  latestReport: MonitoringReport | null;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  monitoringLoading: boolean;
  monitoringError: string | null;
  onCloseMonitoring: () => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  currentUserId,
  conversationId,
  isWaliSupervised,
  onReportMessage,
  showRetentionSettings,
  showSecuritySettings,
  showMonitoring,
  showEmergencyPanel,
  otherUserId,
  latestReport,
  monitoringEnabled,
  toggleMonitoring,
  monitoringLoading,
  monitoringError,
  onCloseMonitoring,
}) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <ChatControlPanel
        showRetentionSettings={showRetentionSettings}
        showSecuritySettings={showSecuritySettings}
        showMonitoring={showMonitoring}
        showEmergencyPanel={showEmergencyPanel}
        conversationId={conversationId}
        userId={currentUserId}
        otherUserId={otherUserId}
        latestReport={latestReport}
        monitoringEnabled={monitoringEnabled}
        toggleMonitoring={toggleMonitoring}
        monitoringLoading={monitoringLoading}
        monitoringError={monitoringError}
        onCloseMonitoring={onCloseMonitoring}
      />

      <MessagesList
        messages={messages}
        currentUserId={currentUserId}
        onReportMessage={onReportMessage}
        isWaliSupervised={isWaliSupervised}
        conversationId={conversationId}
        loading={false}
        error={null}
      />

      {isWaliSupervised && <WaliSupervisor conversationId={conversationId} />}
    </div>
  );
};

export default ChatBody;
