
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { debugService } from '@/hooks/useLazyLoading/services/debug/debugService';
import { Monitor, Download, Trash2, RefreshCw, Activity } from 'lucide-react';

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
    setRefreshKey(prev => prev + 1);
  };

  const handleClearMetrics = () => {
    debugService.clearMetrics();
    setRefreshKey(prev => prev + 1);
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

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (time: number, type: 'load' | 'intersection' | 'render') => {
    const thresholds = {
      load: { good: 500, fair: 1000 },
      intersection: { good: 50, fair: 100 },
      render: { good: 16, fair: 33 },
    };
    
    const threshold = thresholds[type];
    if (time <= threshold.good) return 'bg-green-500';
    if (time <= threshold.fair) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!show) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggle?.(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Monitor className="h-4 w-4 mr-2" />
        Lazy Loading Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Lazy Loading Monitor
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadReport}>
              <Download className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearMetrics}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onToggle?.(false)}>
              ×
            </Button>
          </div>
        </div>
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
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {Array.from(metrics.entries()).map(([elementId, metric]) => (
                  <Card key={elementId} className="p-2">
                    <div className="text-xs font-medium truncate mb-1">
                      {elementId}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Load:</span>
                        <Badge 
                          variant="outline" 
                          className={`text-white ${getPerformanceColor(metric.loadTime, 'load')}`}
                        >
                          {formatDuration(metric.loadTime)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Intersection:</span>
                        <Badge 
                          variant="outline"
                          className={`text-white ${getPerformanceColor(metric.intersectionTime, 'intersection')}`}
                        >
                          {formatDuration(metric.intersectionTime)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Render:</span>
                        <Badge 
                          variant="outline"
                          className={`text-white ${getPerformanceColor(metric.renderTime, 'render')}`}
                        >
                          {formatDuration(metric.renderTime)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Retries:</span>
                        <Badge variant={metric.retryCount > 0 ? "destructive" : "secondary"}>
                          {metric.retryCount}
                        </Badge>
                      </div>
                    </div>
                    
                    {metric.errorCount > 0 && (
                      <div className="mt-1">
                        <Badge variant="destructive" className="text-xs">
                          {metric.errorCount} errors
                        </Badge>
                      </div>
                    )}
                  </Card>
                ))}
                
                {metrics.size === 0 && (
                  <div className="text-center text-gray-500 text-xs py-4">
                    No performance data available
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="events" className="mt-2">
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {events.slice(-50).reverse().map((event, index) => (
                  <div key={index} className="text-xs p-1 border rounded">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{event.type}</Badge>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.elementId && (
                      <div className="truncate text-gray-600 mt-1">
                        {event.elementId}
                      </div>
                    )}
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center text-gray-500 text-xs py-4">
                    No events recorded
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LazyLoadingDevPanel;
