
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DevPanelHeader from './DevPanelHeader';
import MetricsTab from './MetricsTab';
import EventsTab from './EventsTab';

interface DevPanelContentProps {
  metrics: Map<string, any>;
  events: any[];
  onRefresh: () => void;
  onDownloadReport: () => void;
  onClearMetrics: () => void;
  onToggle: (show: boolean) => void;
}

const DevPanelContent = ({
  metrics,
  events,
  onRefresh,
  onDownloadReport,
  onClearMetrics,
  onToggle,
}: DevPanelContentProps) => {
  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <DevPanelHeader
          onRefresh={onRefresh}
          onDownloadReport={onDownloadReport}
          onClearMetrics={onClearMetrics}
          onToggle={onToggle}
        />
      </CardHeader>
      
      <CardContent className="p-2">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics" className="text-xs">
              Metrics ({metrics.size})
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs">
              Events ({events.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="mt-2">
            <MetricsTab metrics={metrics} />
          </TabsContent>
          
          <TabsContent value="events" className="mt-2">
            <EventsTab events={events} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DevPanelContent;
