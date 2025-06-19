
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Download, 
  Gauge, 
  Network, 
  Trash2, 
  Users,
  Zap
} from 'lucide-react';
import { useApplicationMonitoring } from '@/hooks/useApplicationMonitoring';
import { logger } from '@/services/logging/LoggingService';
import { formatDistanceToNow } from 'date-fns';

const MonitoringDashboard: React.FC = () => {
  const {
    isMonitoring,
    performanceMetrics,
    errors,
    userSession,
    networkStatus,
    isSlowConnection,
    startMonitoring,
    stopMonitoring,
    getMonitoringReport,
    exportMonitoringData,
  } = useApplicationMonitoring();

  const [logs, setLogs] = useState(logger.getLocalLogs());

  // Refresh logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(logger.getLocalLogs());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = () => {
    const data = exportMonitoringData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getPerformanceGrade = (metric: number, thresholds: [number, number, number]) => {
    if (metric <= thresholds[0]) return { grade: 'A', color: 'bg-green-500' };
    if (metric <= thresholds[1]) return { grade: 'B', color: 'bg-yellow-500' };
    if (metric <= thresholds[2]) return { grade: 'C', color: 'bg-orange-500' };
    return { grade: 'D', color: 'bg-red-500' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and performance analytics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-500'}`} />
              <div className="space-y-1">
                <p className="text-sm font-medium">Status</p>
                <p className="text-2xl font-bold">{isMonitoring ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Network</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold capitalize">{networkStatus}</p>
                  {isSlowConnection && (
                    <Badge variant="destructive" className="text-xs">Slow</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold">{errors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Session Time</p>
                <p className="text-2xl font-bold">{Math.floor(userSession.totalTimeSpent / 60)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="session">Session</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Page Load Time</span>
                      {(() => {
                        const { grade, color } = getPerformanceGrade(performanceMetrics.pageLoadTime, [1000, 2000, 3000]);
                        return <Badge className={`${color} text-white`}>{grade}</Badge>;
                      })()}
                    </div>
                    <p className="text-2xl font-bold">{Math.round(performanceMetrics.pageLoadTime)}ms</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">First Contentful Paint</span>
                      {(() => {
                        const { grade, color } = getPerformanceGrade(performanceMetrics.firstContentfulPaint, [1800, 3000, 4500]);
                        return <Badge className={`${color} text-white`}>{grade}</Badge>;
                      })()}
                    </div>
                    <p className="text-2xl font-bold">{Math.round(performanceMetrics.firstContentfulPaint)}ms</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time to First Byte</span>
                      {(() => {
                        const { grade, color } = getPerformanceGrade(performanceMetrics.timeToFirstByte, [600, 1000, 1500]);
                        return <Badge className={`${color} text-white`}>{grade}</Badge>;
                      })()}
                    </div>
                    <p className="text-2xl font-bold">{Math.round(performanceMetrics.timeToFirstByte)}ms</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Connection Type</span>
                    <p className="text-2xl font-bold capitalize">{performanceMetrics.connectionType}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No performance metrics available. Start monitoring to collect data.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Session ID</span>
                    <p className="font-mono text-sm">{userSession.sessionId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Started</span>
                    <p>{formatDistanceToNow(new Date(userSession.startTime), { addSuffix: true })}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Last Activity</span>
                    <p>{formatDistanceToNow(new Date(userSession.lastActivity), { addSuffix: true })}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Page Views</span>
                    <p className="text-2xl font-bold">{userSession.pageViews}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Actions</span>
                    <p className="text-2xl font-bold">{userSession.actionsCount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Total Time</span>
                    <p className="text-2xl font-bold">{Math.floor(userSession.totalTimeSpent / 60)}m {userSession.totalTimeSpent % 60}s</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Log ({errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {errors.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {errors.map((error, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive">Error</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="font-medium">{error.message}</p>
                        {error.stack && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Stack Trace</summary>
                            <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No errors recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Logs ({logs.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleClearLogs}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {logs.slice(-100).reverse().map((log, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm border-b pb-2">
                        <Badge 
                          variant={
                            log.level === 'ERROR' ? 'destructive' : 
                            log.level === 'WARN' ? 'default' : 
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {log.level}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                          <p>{log.message}</p>
                          {log.context && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                Context
                              </summary>
                              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No logs available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
