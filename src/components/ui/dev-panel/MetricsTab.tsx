
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MetricsTabProps {
  metrics: Map<string, any>;
}

const MetricsTab = ({ metrics }: MetricsTabProps) => {
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

  return (
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
  );
};

export default MetricsTab;
