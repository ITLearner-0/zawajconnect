import React from 'react';
import { WifiOff, Signal } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useLazyLoading/useNetworkStatus';

interface LazyImageStatusIndicatorsProps {
  showNetworkStatus?: boolean;
  showPerformanceInfo?: boolean;
  enableAnalytics?: boolean;
  monitoring: any;
}

const LazyImageStatusIndicators = ({
  showNetworkStatus = false,
  showPerformanceInfo = false,
  enableAnalytics = false,
  monitoring,
}: LazyImageStatusIndicatorsProps) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  return (
    <>
      {/* Performance Info */}
      {showPerformanceInfo && monitoring.performance?.metrics && (
        <div className="absolute top-0 left-0 z-20 bg-black bg-opacity-75 text-white text-xs p-1 rounded-br">
          <div>Grade: {monitoring.performance.getPerformanceGrade()}</div>
          <div>Time: {monitoring.performance.metrics.totalTime.toFixed(0)}ms</div>
          {monitoring.performance.metrics.transferSize > 0 && (
            <div>Size: {(monitoring.performance.metrics.transferSize / 1024).toFixed(1)}KB</div>
          )}
        </div>
      )}

      {/* Analytics Info */}
      {enableAnalytics && monitoring.analytics?.aggregatedMetrics && (
        <div className="absolute top-0 right-0 z-20 bg-blue-900 bg-opacity-75 text-white text-xs p-1 rounded-bl">
          <div>Success: {monitoring.analytics.aggregatedMetrics.successRate.toFixed(1)}%</div>
          <div>Cache: {monitoring.analytics.aggregatedMetrics.cacheHitRate.toFixed(1)}%</div>
        </div>
      )}

      {/* Network Status Indicator */}
      {showNetworkStatus && (
        <div className="absolute top-2 right-2 z-10">
          {!isOnline ? (
            <WifiOff className="h-4 w-4 text-red-500" />
          ) : isSlowConnection ? (
            <Signal className="h-4 w-4 text-yellow-500" />
          ) : (
            <Signal className="h-4 w-4 text-green-500" />
          )}
        </div>
      )}
    </>
  );
};

export default LazyImageStatusIndicators;
