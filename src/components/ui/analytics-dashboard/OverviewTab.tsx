import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { formatters, APP_CONSTANTS } from '@/utils/helpers';
import { AggregatedMetrics } from '@/hooks/useLazyLoading/services/analyticsService';
import MetricCard from './MetricCard';

interface OverviewTabProps {
  metrics: AggregatedMetrics | null;
}

const OverviewTab = ({ metrics }: OverviewTabProps) => {
  const getPerformanceColor = (grade: string) => {
    return (
      APP_CONSTANTS.COLORS.GRADE_COLORS[grade as keyof typeof APP_CONSTANTS.COLORS.GRADE_COLORS] ||
      'text-gray-600'
    );
  };

  if (!metrics) {
    return <div className="text-center py-8 text-gray-500">No analytics data available yet</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Total Elements"
          value={metrics.totalElements}
          icon={CheckCircle}
          iconColor="text-green-500"
        />

        <MetricCard
          title="Success Rate"
          value={formatters.percentage(metrics.successRate)}
          icon={TrendingUp}
          iconColor="text-blue-500"
        />

        <MetricCard
          title="Avg Load Time"
          value={formatters.duration(metrics.averageLoadTime)}
          icon={Clock}
          iconColor="text-orange-500"
        />

        <MetricCard
          title="Cache Hit Rate"
          value={formatters.percentage(metrics.cacheHitRate)}
          description={
            <div className={`text-2xl ${getPerformanceColor(metrics.performanceGrade)}`}>
              {formatters.capitalize(metrics.performanceGrade)}
            </div>
          }
          icon={CheckCircle}
          iconColor="text-purple-500"
        />
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Performance Grade</h4>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              metrics.performanceGrade === 'excellent' || metrics.performanceGrade === 'good'
                ? 'default'
                : 'destructive'
            }
            className={getPerformanceColor(metrics.performanceGrade)}
          >
            {formatters.capitalize(metrics.performanceGrade)}
          </Badge>
          <Progress
            value={
              metrics.performanceGrade === 'excellent'
                ? 100
                : metrics.performanceGrade === 'good'
                  ? 75
                  : metrics.performanceGrade === 'fair'
                    ? 50
                    : 25
            }
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
