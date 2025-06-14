
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { APP_CONSTANTS } from '@/utils/helpers';
import { UsagePattern } from '@/hooks/useLazyLoading/services/analyticsService';

interface UsageTabProps {
  usagePatterns: Map<string, UsagePattern>;
}

const UsageTab = ({ usagePatterns }: UsageTabProps) => {
  const deviceTypeData = Array.from(usagePatterns.entries()).map(([key, pattern]) => ({
    name: pattern.elementType,
    value: pattern.loadFrequency,
  }));

  return (
    <ScrollArea className="h-96">
      <div className="space-y-4">
        {usagePatterns.size > 0 ? (
          <>
            <div>
              <h4 className="font-semibold mb-2">Element Type Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={APP_CONSTANTS.COLORS.CHART_COLORS[index % APP_CONSTANTS.COLORS.CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Usage Patterns</h4>
              <div className="space-y-2">
                {Array.from(usagePatterns.entries()).map(([elementId, pattern]) => (
                  <Card key={elementId} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium truncate">{elementId}</p>
                        <p className="text-sm text-gray-600">{pattern.elementType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Loads: {pattern.loadFrequency}</p>
                        <p className="text-sm">Conversions: {pattern.conversionEvents}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No usage patterns data available yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default UsageTab;
