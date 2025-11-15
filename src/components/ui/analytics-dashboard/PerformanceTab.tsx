import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatters } from '@/utils/helpers';

interface PerformanceTabProps {
  performanceData: Array<{
    timestamp: string;
    loadTime: number;
    successRate: number;
  }>;
}

const PerformanceTab = ({ performanceData }: PerformanceTabProps) => {
  return (
    <ScrollArea className="h-96">
      <div className="space-y-4">
        {performanceData.length > 0 ? (
          <>
            <div>
              <h4 className="font-semibold mb-2">Load Time Trends</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'loadTime'
                        ? formatters.duration(value)
                        : formatters.percentage(value),
                      name === 'loadTime' ? 'Load Time' : 'Success Rate',
                    ]}
                  />
                  <Line type="monotone" dataKey="loadTime" stroke="#8884d8" name="loadTime" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Success Rate Trends</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value: number) => [formatters.percentage(value), 'Success Rate']}
                  />
                  <Line type="monotone" dataKey="successRate" stroke="#82ca9d" name="successRate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No performance trends data available yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PerformanceTab;
