
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { APIMetrics } from '@/services/performance/apiMetricsService';

interface ApiTabProps {
  apiMetrics: APIMetrics[];
  averageResponseTime: number;
  errorRate: number;
  formatTime: (ms: number) => string;
}

const ApiTab: React.FC<ApiTabProps> = ({
  apiMetrics,
  averageResponseTime,
  errorRate,
  formatTime,
}) => {
  const recentApiCalls = apiMetrics.slice(-10).reverse();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">{formatTime(averageResponseTime)}</div>
          <div className="text-muted-foreground">Avg Response</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">{errorRate.toFixed(1)}%</div>
          <div className="text-muted-foreground">Error Rate</div>
        </div>
      </div>

      {recentApiCalls.map((api, index) => (
        <div key={index} className="text-xs p-2 border rounded">
          <div className="flex justify-between items-center">
            <span className="font-medium">{api.method}</span>
            <Badge 
              variant={api.status >= 400 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {api.status}
            </Badge>
          </div>
          <div className="truncate text-muted-foreground">{api.endpoint}</div>
          <div className="flex justify-between">
            <span>Duration: {formatTime(api.duration)}</span>
            <span>{new Date(api.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
      
      {apiMetrics.length === 0 && (
        <div className="text-center text-muted-foreground text-xs py-4">
          No API calls tracked yet
        </div>
      )}
    </div>
  );
};

export default ApiTab;
