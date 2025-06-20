
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Cpu, 
  Database, 
  Gauge, 
  MemoryStick,
  Minimize2,
  Maximize2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

interface PerformanceWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({ 
  position = 'bottom-left' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    metrics,
    getPerformanceSummary,
    clearMetrics,
    isTracking,
    startTracking,
    stopTracking,
  } = usePerformanceMetrics();

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

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <Card className={`shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-96 h-[500px]' : 'w-64 h-auto'
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Performance
              <Badge variant={isTracking ? "default" : "secondary"} className="text-xs">
                {isTracking ? 'ON' : 'OFF'}
              </Badge>
            </CardTitle>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3">
          {!isExpanded ? (
            // Compact view
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Page Load:</span>
                <span className={getScoreColor(summary.page?.loadTime || 0, [1000, 3000])}>
                  {formatTime(summary.page?.loadTime || 0)}
                </span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Memory:</span>
                <span>{formatMemory(summary.memory)}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>API Avg:</span>
                <span className={getScoreColor(summary.api.averageResponseTime, [500, 1000])}>
                  {formatTime(summary.api.averageResponseTime)}
                </span>
              </div>
              
              <div className="flex gap-1 mt-2">
                <Button
                  variant={isTracking ? "destructive" : "default"}
                  size="sm"
                  onClick={isTracking ? stopTracking : startTracking}
                  className="flex-1 text-xs h-6"
                >
                  {isTracking ? 'Stop' : 'Start'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMetrics}
                  className="text-xs h-6 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            // Expanded view
            <div className="h-full flex flex-col">
              {/* Tabs */}
              <div className="flex border-b mb-3">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'components', label: 'Components', icon: Cpu },
                  { id: 'api', label: 'API', icon: Database },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs ${
                      activeTab === id ? 'border-b-2 border-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    {/* Page Metrics */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Page Performance
                      </h4>
                      
                      {summary.page && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Load Time:</span>
                            <div className={getScoreColor(summary.page.loadTime, [1000, 3000])}>
                              {formatTime(summary.page.loadTime)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">FCP:</span>
                            <div className={getScoreColor(summary.page.firstContentfulPaint, [1800, 3000])}>
                              {formatTime(summary.page.firstContentfulPaint)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LCP:</span>
                            <div className={getScoreColor(summary.page.largestContentfulPaint, [2500, 4000])}>
                              {formatTime(summary.page.largestContentfulPaint)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CLS:</span>
                            <div className={getScoreColor(summary.page.cumulativeLayoutShift * 1000, [100, 250])}>
                              {summary.page.cumulativeLayoutShift.toFixed(3)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Memory Usage */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" />
                        Memory Usage
                      </h4>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>Current:</span>
                          <span>{formatMemory(summary.memory)}</span>
                        </div>
                        <Progress 
                          value={Math.min((summary.memory / (50 * 1024 * 1024)) * 100, 100)} 
                          className="h-1 mt-1"
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{summary.components.total}</div>
                        <div className="text-muted-foreground">Components</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{summary.api.total}</div>
                        <div className="text-muted-foreground">API Calls</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'components' && (
                  <div className="space-y-2">
                    {Array.from(metrics.componentMetrics.values())
                      .sort((a, b) => b.renderTime - a.renderTime)
                      .slice(0, 10)
                      .map((component) => (
                        <div key={component.componentName} className="text-xs p-2 border rounded">
                          <div className="font-medium truncate">{component.componentName}</div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Render: {formatTime(component.renderTime)}</span>
                            <span>Updates: {component.updateCount}</span>
                          </div>
                        </div>
                      ))}
                    
                    {metrics.componentMetrics.size === 0 && (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        No component data yet
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{formatTime(summary.api.averageResponseTime)}</div>
                        <div className="text-muted-foreground">Avg Response</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{summary.api.errorRate.toFixed(1)}%</div>
                        <div className="text-muted-foreground">Error Rate</div>
                      </div>
                    </div>

                    {metrics.apiMetrics.slice(-10).reverse().map((api, index) => (
                      <div key={index} className="text-xs p-2 border rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{api.method}</span>
                          <Badge 
                            variant={api.status >= 400 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {api.status}
                          </Badge>
                        </div>
                        <div className="truncate text-muted-foreground">{api.endpoint}</div>
                        <div className="flex justify-between">
                          <span>Duration: {formatTime(api.duration)}</span>
                          <span>{new Date(api.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                    
                    {metrics.apiMetrics.length === 0 && (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        No API calls tracked yet
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Controls */}
              <div className="flex gap-2 mt-3 pt-2 border-t">
                <Button
                  variant={isTracking ? "destructive" : "default"}
                  size="sm"
                  onClick={isTracking ? stopTracking : startTracking}
                  className="flex-1 text-xs h-7"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {isTracking ? 'Stop' : 'Start'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMetrics}
                  className="text-xs h-7"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceWidget;
