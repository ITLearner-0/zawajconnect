
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, MemoryStick } from 'lucide-react';
import { PageMetrics } from '@/services/performance/pageMetricsService';

interface OverviewTabProps {
  pageMetrics: PageMetrics | null;
  memory: number;
  componentCount: number;
  apiCount: number;
  formatTime: (ms: number) => string;
  formatMemory: (bytes: number) => string;
  getScoreColor: (score: number, thresholds: [number, number]) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  pageMetrics,
  memory,
  componentCount,
  apiCount,
  formatTime,
  formatMemory,
  getScoreColor,
}) => {
  return (
    <div className="space-y-3">
      {/* Page Metrics */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Page Performance
        </h4>
        
        {pageMetrics && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Load Time:</span>
              <div className={getScoreColor(pageMetrics.loadTime, [1000, 3000])}>
                {formatTime(pageMetrics.loadTime)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">FCP:</span>
              <div className={getScoreColor(pageMetrics.firstContentfulPaint, [1800, 3000])}>
                {formatTime(pageMetrics.firstContentfulPaint)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">LCP:</span>
              <div className={getScoreColor(pageMetrics.largestContentfulPaint, [2500, 4000])}>
                {formatTime(pageMetrics.largestContentfulPaint)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">CLS:</span>
              <div className={getScoreColor(pageMetrics.cumulativeLayoutShift * 1000, [100, 250])}>
                {pageMetrics.cumulativeLayoutShift.toFixed(3)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Memory Usage */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold flex items-center gap-1">
          <MemoryStick className="h-3 w-3" />
          Memory Usage
        </h4>
        <div className="text-xs">
          <div className="flex justify-between">
            <span>Current:</span>
            <span>{formatMemory(memory)}</span>
          </div>
          <Progress 
            value={Math.min((memory / (50 * 1024 * 1024)) * 100, 100)} 
            className="h-1 mt-1"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">{componentCount}</div>
          <div className="text-muted-foreground">Components</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">{apiCount}</div>
          <div className="text-muted-foreground">API Calls</div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
