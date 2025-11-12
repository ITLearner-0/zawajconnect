import React, { useState, useEffect } from 'react';
import { debugService } from '@/hooks/useLazyLoading/services/debug/debugService';
import DevPanelToggle from './dev-panel/DevPanelToggle';
import DevPanelContent from './dev-panel/DevPanelContent';

interface LazyLoadingDevPanelProps {
  show?: boolean;
  onToggle?: (show: boolean) => void;
}

const LazyLoadingDevPanel = ({ show = false, onToggle }: LazyLoadingDevPanelProps) => {
  const [metrics, setMetrics] = useState<Map<string, any>>(new Map());
  const [events, setEvents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (show) {
      const updateData = () => {
        setMetrics(debugService.getMetrics() as Map<string, any>);
        setEvents(debugService.getEvents());
      };

      updateData();
      const interval = setInterval(updateData, 1000);
      return () => clearInterval(interval);
    }
  }, [show, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClearMetrics = () => {
    debugService.clearMetrics();
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownloadReport = () => {
    const report = debugService.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lazy-loading-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!show) {
    return <DevPanelToggle onToggle={onToggle || (() => {})} />;
  }

  return (
    <DevPanelContent
      metrics={metrics}
      events={events}
      onRefresh={handleRefresh}
      onDownloadReport={handleDownloadReport}
      onClearMetrics={handleClearMetrics}
      onToggle={onToggle || (() => {})}
    />
  );
};

export default LazyLoadingDevPanel;
