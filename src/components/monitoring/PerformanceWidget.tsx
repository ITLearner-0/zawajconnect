import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

import PerformanceWidgetHeader from './widget/PerformanceWidgetHeader';
import PerformanceWidgetTabs from './widget/PerformanceWidgetTabs';
import PerformanceWidgetControls from './widget/PerformanceWidgetControls';
import CompactView from './widget/CompactView';
import OverviewTab from './widget/tabs/OverviewTab';
import ComponentsTab from './widget/tabs/ComponentsTab';
import ApiTab from './widget/tabs/ApiTab';

interface PerformanceWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({ position = 'bottom-left' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { metrics, getPerformanceSummary, clearMetrics, isTracking, startTracking, stopTracking } =
    usePerformanceMetrics();

  const summary = getPerformanceSummary();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score <= thresholds[0]) return 'text-green-500';
    if (score <= thresholds[1]) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <Card
        className={`shadow-lg transition-all duration-300 ${
          isExpanded ? 'w-96 h-[500px]' : 'w-64 h-auto'
        }`}
      >
        <CardHeader className="pb-2">
          <PerformanceWidgetHeader
            isTracking={isTracking}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </CardHeader>

        <CardContent className="p-3">
          {!isExpanded ? (
            <div className="space-y-2">
              <CompactView
                pageLoadTime={summary.page?.loadTime || 0}
                memory={summary.memory}
                apiAverageTime={summary.api.averageResponseTime}
                formatTime={formatTime}
                formatMemory={formatMemory}
                getScoreColor={getScoreColor}
              />

              <PerformanceWidgetControls
                isTracking={isTracking}
                isExpanded={isExpanded}
                onToggleTracking={handleToggleTracking}
                onClearMetrics={clearMetrics}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <PerformanceWidgetTabs activeTab={activeTab} onTabChange={setActiveTab} />

              <ScrollArea className="flex-1">
                {activeTab === 'overview' && (
                  <OverviewTab
                    pageMetrics={summary.page}
                    memory={summary.memory}
                    componentCount={summary.components.total}
                    apiCount={summary.api.total}
                    formatTime={formatTime}
                    formatMemory={formatMemory}
                    getScoreColor={getScoreColor}
                  />
                )}

                {activeTab === 'components' && (
                  <ComponentsTab
                    componentMetrics={metrics.componentMetrics}
                    formatTime={formatTime}
                  />
                )}

                {activeTab === 'api' && (
                  <ApiTab
                    apiMetrics={metrics.apiMetrics}
                    averageResponseTime={summary.api.averageResponseTime}
                    errorRate={summary.api.errorRate}
                    formatTime={formatTime}
                  />
                )}
              </ScrollArea>

              <PerformanceWidgetControls
                isTracking={isTracking}
                isExpanded={isExpanded}
                onToggleTracking={handleToggleTracking}
                onClearMetrics={clearMetrics}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceWidget;
