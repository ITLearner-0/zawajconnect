import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  analyticsService,
  AggregatedMetrics,
  UsagePattern,
} from '@/hooks/useLazyLoading/services/analyticsService';
import { TrendingUp } from 'lucide-react';
import { formatters, APP_CONSTANTS } from '@/utils/helpers';
import ErrorBoundary from './ErrorBoundary';
import DashboardHeader from './analytics-dashboard/DashboardHeader';
import OverviewTab from './analytics-dashboard/OverviewTab';
import PerformanceTab from './analytics-dashboard/PerformanceTab';
import UsageTab from './analytics-dashboard/UsageTab';
import InsightsTab from './analytics-dashboard/InsightsTab';

interface LazyLoadingAnalyticsDashboardProps {
  show?: boolean;
  onToggle?: (show: boolean) => void;
}

const LazyLoadingAnalyticsDashboard = ({
  show = false,
  onToggle,
}: LazyLoadingAnalyticsDashboardProps) => {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<Map<string, UsagePattern>>(new Map());
  const [trends, setTrends] = useState<{ timestamp: number; metrics: AggregatedMetrics }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (show) {
      const updateData = () => {
        setMetrics(analyticsService.getAggregatedMetrics());
        setUsagePatterns(analyticsService.getUsagePatterns());
        setTrends(analyticsService.getPerformanceTrends());
      };

      updateData();
      const interval = setInterval(updateData, APP_CONSTANTS.ANALYTICS.REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [show, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = () => {
    const data = analyticsService.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lazy-loading-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const performanceData = trends.map((trend) => ({
    timestamp: formatters.dateTime(new Date(trend.timestamp)),
    loadTime: trend.metrics.averageLoadTime,
    successRate: trend.metrics.successRate,
  }));

  if (!show) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggle?.(true)}
        className="fixed bottom-16 right-4 z-50"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Analytics Dashboard
      </Button>
    );
  }

  return (
    <ErrorBoundary>
      <Card className="fixed top-4 right-4 w-[600px] max-h-[80vh] z-50 shadow-lg bg-white dark:bg-gray-900">
        <DashboardHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          onToggle={onToggle || (() => {})}
        />

        <CardContent className="p-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab metrics={metrics} />
            </TabsContent>

            <TabsContent value="performance">
              <PerformanceTab performanceData={performanceData} />
            </TabsContent>

            <TabsContent value="usage">
              <UsageTab usagePatterns={usagePatterns} />
            </TabsContent>

            <TabsContent value="insights">
              <InsightsTab metrics={metrics} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default LazyLoadingAnalyticsDashboard;
