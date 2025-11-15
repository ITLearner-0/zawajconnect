import { useState } from 'react';

export const useChatControls = () => {
  const [showRetentionSettings, setShowRetentionSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);

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

  return {
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
  };
};
