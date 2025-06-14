
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { AggregatedMetrics } from '@/hooks/useLazyLoading/services/analyticsService';

interface InsightsTabProps {
  metrics: AggregatedMetrics | null;
}

const InsightsTab = ({ metrics }: InsightsTabProps) => {
  return (
    <ScrollArea className="h-96">
      <div className="space-y-4">
        {metrics && (
          <>
            {metrics.bottlenecks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Performance Bottlenecks
                </h4>
                <div className="space-y-2">
                  {metrics.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">{bottleneck}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metrics.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Optimization Recommendations
                </h4>
                <div className="space-y-2">
                  {metrics.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metrics.bottlenecks.length === 0 && metrics.recommendations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No specific insights available yet. 
                <br />
                Keep using lazy loading components to generate more data.
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default InsightsTab;
