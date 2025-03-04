
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MonitoringReport } from '@/services/monitoring';  // Updated import path
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
  onClose
}) => {
  return (
    <Card className="w-full shadow-sm border">
      <MonitoringHeader 
        isEnabled={isEnabled} 
        onToggleMonitoring={onToggleMonitoring} 
        isLoading={isLoading}
        onClose={onClose}
      />
      
      <CardContent className="p-4">
        {!isEnabled ? (
          <div className="text-center p-6">
            <h3 className="font-medium mb-2">AI Monitoring is disabled</h3>
            <p className="text-sm text-muted-foreground">
              Enable monitoring to get real-time insights into conversation compliance.
            </p>
            <Button 
              onClick={onToggleMonitoring} 
              className="mt-4"
              disabled={isLoading}
            >
              Enable Monitoring
            </Button>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : !report ? (
          <div className="text-center p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
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
