
import React from 'react';
import { Violation, MonitoringReport } from '@/services/aiMonitoringService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MonitoringHeader from './monitoring/MonitoringHeader';
import MonitoringSummary from './monitoring/MonitoringSummary';
import ViolationsList from './monitoring/ViolationsList';
import DetailedReport from './monitoring/DetailedReport';
import MonitoringFooter from './monitoring/MonitoringFooter';

interface AIMonitoringDashboardProps {
  violations: Violation[];
  report: MonitoringReport | null;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  loading: boolean;
}

const AIMonitoringDashboard = ({ 
  violations, 
  report, 
  monitoringEnabled,
  toggleMonitoring,
  loading 
}: AIMonitoringDashboardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <MonitoringHeader 
          monitoringEnabled={monitoringEnabled} 
          toggleMonitoring={toggleMonitoring} 
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="violations">
              Violations
              {violations.length > 0 && (
                <Badge variant="destructive" className="ml-2">{violations.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="report">Detailed Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <MonitoringSummary report={report} loading={loading} />
          </TabsContent>
          
          <TabsContent value="violations">
            <ViolationsList violations={violations} />
          </TabsContent>
          
          <TabsContent value="report">
            <DetailedReport report={report} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <MonitoringFooter report={report} />
    </Card>
  );
};

export default AIMonitoringDashboard;
