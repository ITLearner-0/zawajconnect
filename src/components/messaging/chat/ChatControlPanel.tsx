import React from 'react';
import RetentionSettings from '../RetentionSettings';
import SecuritySettingsPanel from '../SecuritySettingsPanel';
import AIMonitoringDashboard from '../AIMonitoringDashboard';
import EmergencyPanel from '../EmergencyPanel';
import { MonitoringReport } from '@/services/monitoring';

interface ChatControlPanelProps {
  showRetentionSettings: boolean;
  showSecuritySettings: boolean;
  showMonitoring: boolean;
  showEmergencyPanel: boolean;
  conversationId: string;
  userId: string;
  otherUserId: string;
  latestReport: MonitoringReport | null;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  monitoringLoading: boolean;
  monitoringError: string | null;
  onCloseMonitoring: () => void;
}

const ChatControlPanel: React.FC<ChatControlPanelProps> = ({
  showRetentionSettings,
  showSecuritySettings,
  showMonitoring,
  showEmergencyPanel,
  conversationId,
  userId,
  otherUserId,
  latestReport,
  monitoringEnabled,
  toggleMonitoring,
  monitoringLoading,
  monitoringError,
  onCloseMonitoring,
}) => {
  return (
    <>
      {showRetentionSettings && (
        <RetentionSettings
          conversationId={conversationId}
          currentPolicy={{
            type: 'permanent',
            auto_delete: false,
          }}
          onPolicyChanged={() => {}}
        />
      )}

      {showSecuritySettings && (
        <SecuritySettingsPanel encryptionEnabled={true} toggleEncryption={() => {}} />
      )}

      {showMonitoring && (
        <AIMonitoringDashboard
          report={latestReport}
          isEnabled={monitoringEnabled}
          onToggleMonitoring={toggleMonitoring}
          isLoading={monitoringLoading}
          error={monitoringError}
          onClose={onCloseMonitoring}
        />
      )}

      {showEmergencyPanel && (
        <EmergencyPanel conversationId={conversationId} userId={userId} otherUserId={otherUserId} />
      )}
    </>
  );
};

export default ChatControlPanel;
