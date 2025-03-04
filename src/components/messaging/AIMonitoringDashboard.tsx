
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitoringReport } from '@/services/aiMonitoringService';
import MonitoringHeader from './monitoring/MonitoringHeader';
import MonitoringSummary from './monitoring/MonitoringSummary';
import DetailedReport from './monitoring/DetailedReport';
import MonitoringFooter from './monitoring/MonitoringFooter';

interface AIMonitoringDashboardProps {
  report: MonitoringReport | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onToggleMonitoring: () => void;
  isEnabled: boolean;
}

const AIMonitoringDashboard: React.FC<AIMonitoringDashboardProps> = ({
  report,
  isLoading,
  error,
  onClose,
  onToggleMonitoring,
  isEnabled
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <MonitoringHeader 
          onClose={onClose} 
          monitoringEnabled={isEnabled} 
          toggleMonitoring={onToggleMonitoring} 
        />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing conversation...</p>
            <p className="text-sm text-gray-500 mt-2">This might take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <MonitoringHeader 
          onClose={onClose} 
          monitoringEnabled={isEnabled} 
          toggleMonitoring={onToggleMonitoring} 
        />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center text-red-600">
            <p className="mb-2 font-medium">Error analyzing conversation</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col h-full">
        <MonitoringHeader 
          onClose={onClose} 
          monitoringEnabled={isEnabled} 
          toggleMonitoring={onToggleMonitoring} 
        />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="text-center text-gray-600">
            <p>No monitoring data available yet</p>
            <p className="text-sm mt-2">Start or continue a conversation to generate an analysis</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MonitoringHeader 
        onClose={onClose} 
        monitoringEnabled={isEnabled} 
        toggleMonitoring={onToggleMonitoring} 
      />
      
      <div className="flex-grow overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="flex-grow mt-2">
            <MonitoringSummary report={report} />
          </TabsContent>
          
          <TabsContent value="detailed" className="flex-grow mt-2">
            <DetailedReport report={report} />
          </TabsContent>
        </Tabs>
      </div>
      
      <MonitoringFooter report={report} />
    </div>
  );
};

export default AIMonitoringDashboard;
