import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MonitoringReport } from '@/services/monitoring'; // Updated import path
import { X } from 'lucide-react';
import MonitoringHeader from './monitoring/MonitoringHeader';
import MonitoringFooter from './monitoring/MonitoringFooter';
import MonitoringSummary from './monitoring/MonitoringSummary';
import DetailedReport from './monitoring/DetailedReport';

interface AIMonitoringDashboardProps {
  report: MonitoringReport | null;
  isEnabled: boolean;
  onToggleMonitoring: () => void;
  isLoading: boolean;
  error: string | null;
  onClose?: () => void;
}

const AIMonitoringDashboard: React.FC<AIMonitoringDashboardProps> = ({
  report,
  isEnabled,
  onToggleMonitoring,
  isLoading,
  error,
  onClose,
}) => {
  return (
    <Card className="w-full shadow-sm border border-islamic-teal/20 dark:border-islamic-darkTeal/30 bg-white dark:bg-islamic-darkCard">
      <MonitoringHeader
        isEnabled={isEnabled}
        onToggleMonitoring={onToggleMonitoring}
        isLoading={isLoading}
        onClose={onClose}
      />

      <CardContent className="p-4">
        {!isEnabled ? (
          <div className="text-center p-6">
            <h3 className="font-medium mb-2 text-islamic-burgundy dark:text-islamic-cream">
              AI Monitoring is disabled
            </h3>
            <p className="text-sm text-muted-foreground dark:text-islamic-cream/70">
              Enable monitoring to get real-time insights into conversation compliance.
            </p>
            <Button
              onClick={onToggleMonitoring}
              className="mt-4 bg-islamic-brightGold text-islamic-burgundy hover:bg-islamic-brightGold/90 dark:bg-islamic-darkBrightGold dark:text-islamic-cream dark:hover:bg-islamic-darkBrightGold/90"
              disabled={isLoading}
            >
              Enable Monitoring
            </Button>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : !report ? (
          <div className="text-center p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-islamic-teal/10 dark:bg-islamic-darkTeal/20 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-islamic-teal/10 dark:bg-islamic-darkTeal/20 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-sm text-muted-foreground dark:text-islamic-cream/70 mt-4">
              Generating compliance report...
            </p>
          </div>
        ) : (
          <>
            <MonitoringSummary report={report} />
            <DetailedReport report={report} />
          </>
        )}
      </CardContent>

      <MonitoringFooter report={report} />
    </Card>
  );
};

export default AIMonitoringDashboard;
