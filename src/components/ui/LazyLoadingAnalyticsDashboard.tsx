import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyticsService, AggregatedMetrics, UsagePattern } from '@/hooks/useLazyLoading/services/analyticsService';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatters, APP_CONSTANTS } from '@/utils/helpers';
import ErrorBoundary from './ErrorBoundary';

interface LazyLoadingAnalyticsDashboardProps {
  show?: boolean;
  onToggle?: (show: boolean) => void;
}

const LazyLoadingAnalyticsDashboard = ({ show = false, onToggle }: LazyLoadingAnalyticsDashboardProps) => {
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

  const getPerformanceColor = (grade: string) => {
    return APP_CONSTANTS.COLORS.GRADE_COLORS[grade as keyof typeof APP_CONSTANTS.COLORS.GRADE_COLORS] || 'text-gray-600';
  };

  // Prepare chart data
  const performanceData = trends.map(trend => ({
    timestamp: formatters.dateTime(new Date(trend.timestamp)),
    loadTime: trend.metrics.averageLoadTime,
    successRate: trend.metrics.successRate,
  }));

  const deviceTypeData = Array.from(usagePatterns.entries()).map(([key, pattern]) => ({
    name: pattern.elementType,
    value: pattern.loadFrequency,
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
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lazy Loading Analytics
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onToggle?.(false)}>
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4 space-y-4">
              {metrics ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Elements</p>
                          <p className="text-2xl font-bold">{metrics.totalElements}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="text-2xl font-bold">{formatters.percentage(metrics.successRate)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg Load Time</p>
                          <p className="text-2xl font-bold">{formatters.duration(metrics.averageLoadTime)}</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Cache Hit Rate</p>
                          <p className="text-2xl font-bold">{formatters.percentage(metrics.cacheHitRate)}</p>
                        </div>
                        <div className={`text-2xl ${getPerformanceColor(metrics.performanceGrade)}`}>
                          {formatters.capitalize(metrics.performanceGrade)}
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Performance Grade</h4>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={metrics.performanceGrade === 'excellent' || metrics.performanceGrade === 'good' ? 'default' : 'destructive'}
                        className={getPerformanceColor(metrics.performanceGrade)}
                      >
                        {formatters.capitalize(metrics.performanceGrade)}
                      </Badge>
                      <Progress 
                        value={
                          metrics.performanceGrade === 'excellent' ? 100 :
                          metrics.performanceGrade === 'good' ? 75 :
                          metrics.performanceGrade === 'fair' ? 50 : 25
                        } 
                        className="flex-1" 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No analytics data available yet
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="performance" className="mt-4">
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
                                name === 'loadTime' ? formatters.duration(value) : formatters.percentage(value),
                                name === 'loadTime' ? 'Load Time' : 'Success Rate'
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
            </TabsContent>
            
            <TabsContent value="usage" className="mt-4">
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
          </TabsContent>
          
          <TabsContent value="insights" className="mt-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </ErrorBoundary>
  );
};

export default LazyLoadingAnalyticsDashboard;
