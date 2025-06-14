
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsService, AggregatedMetrics, UsagePattern } from '@/hooks/useLazyLoading/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Download, RefreshCw, Trash2, BarChart3, Activity, Users, AlertTriangle } from 'lucide-react';

interface LazyLoadingAnalyticsDashboardProps {
  show?: boolean;
  onToggle?: (show: boolean) => void;
}

const LazyLoadingAnalyticsDashboard = ({ show = false, onToggle }: LazyLoadingAnalyticsDashboardProps) => {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<Map<string, UsagePattern>>(new Map());
  const [trends, setTrends] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (show) {
      const updateData = () => {
        setMetrics(analyticsService.getAggregatedMetrics());
        setUsagePatterns(analyticsService.getUsagePatterns());
        setTrends(analyticsService.getPerformanceTrends());
      };
      
      updateData();
      const interval = setInterval(updateData, 5000);
      return () => clearInterval(interval);
    }
  }, [show, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  const handleClear = () => {
    analyticsService.clearMetrics();
    setRefreshKey(prev => prev + 1);
  };

  const getPerformanceColor = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number, unit: string = '') => {
    if (num < 1000) return `${num.toFixed(1)}${unit}`;
    if (num < 1000000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${(num / 1000000).toFixed(1)}m${unit}`;
  };

  const pieData = [
    { name: 'Success', value: metrics?.successRate || 0, color: '#10b981' },
    { name: 'Errors', value: metrics?.errorRate || 0, color: '#ef4444' },
    { name: 'Retries', value: metrics?.retryRate || 0, color: '#f59e0b' },
  ];

  if (!show) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggle?.(true)}
        className="fixed bottom-20 right-4 z-50"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[600px] max-h-[600px] z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Lazy Loading Analytics
            {metrics && (
              <Badge variant="outline" className={`text-white ${getPerformanceColor(metrics.performanceGrade)}`}>
                {metrics.performanceGrade}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onToggle?.(false)}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="usage" className="text-xs">Usage</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-2">
            <ScrollArea className="h-[480px]">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Card className="p-3">
                  <div className="text-xs text-gray-600">Total Elements</div>
                  <div className="text-lg font-bold">{metrics?.totalElements || 0}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-gray-600">Success Rate</div>
                  <div className="text-lg font-bold text-green-600">
                    {metrics?.successRate.toFixed(1) || 0}%
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-gray-600">Avg Load Time</div>
                  <div className="text-lg font-bold">
                    {metrics?.averageLoadTime.toFixed(0) || 0}ms
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-gray-600">Cache Hit Rate</div>
                  <div className="text-lg font-bold text-blue-600">
                    {metrics?.cacheHitRate.toFixed(1) || 0}%
                  </div>
                </Card>
              </div>
              
              {metrics && (
                <Card className="p-3">
                  <h4 className="text-sm font-medium mb-2">Success/Error Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-2">
            <ScrollArea className="h-[480px]">
              {trends.length > 0 && (
                <Card className="p-3 mb-4">
                  <h4 className="text-sm font-medium mb-2">Performance Trends</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value) => [`${value.toFixed(1)}ms`, 'Load Time']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="metrics.averageLoadTime" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3">
                  <div className="text-xs text-gray-600">Intersection Time</div>
                  <div className="text-lg font-bold">
                    {metrics?.averageIntersectionTime.toFixed(0) || 0}ms
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-gray-600">Error Rate</div>
                  <div className="text-lg font-bold text-red-600">
                    {metrics?.errorRate.toFixed(1) || 0}%
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="usage" className="mt-2">
            <ScrollArea className="h-[480px]">
              <div className="space-y-2">
                {Array.from(usagePatterns.entries()).map(([elementId, pattern]) => (
                  <Card key={elementId} className="p-3">
                    <div className="text-xs font-medium truncate mb-1">
                      {elementId}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline" className="ml-1">
                          {pattern.elementType}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-1 font-medium">{pattern.loadFrequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversions:</span>
                        <span className="ml-1 font-medium">{pattern.conversionEvents}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bounce Rate:</span>
                        <span className="ml-1 font-medium">{pattern.bounceRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {usagePatterns.size === 0 && (
                  <div className="text-center text-gray-500 text-xs py-8">
                    No usage data available
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-2">
            <ScrollArea className="h-[480px]">
              <div className="space-y-4">
                {metrics?.bottlenecks && metrics.bottlenecks.length > 0 && (
                  <Card className="p-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Bottlenecks Detected
                    </h4>
                    <div className="space-y-1">
                      {metrics.bottlenecks.map((bottleneck, index) => (
                        <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {bottleneck}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                
                {metrics?.recommendations && metrics.recommendations.length > 0 && (
                  <Card className="p-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-1">
                      {metrics.recommendations.map((recommendation, index) => (
                        <div key={index} className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          {recommendation}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                
                {(!metrics?.bottlenecks?.length && !metrics?.recommendations?.length) && (
                  <div className="text-center text-gray-500 text-xs py-8">
                    No insights available yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LazyLoadingAnalyticsDashboard;
