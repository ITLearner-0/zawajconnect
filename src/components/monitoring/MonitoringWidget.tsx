
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Gauge, 
  Network,
  X 
} from 'lucide-react';
import { useApplicationMonitoring } from '@/hooks/useApplicationMonitoring';

interface MonitoringWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showInProduction?: boolean;
}

const MonitoringWidget: React.FC<MonitoringWidgetProps> = ({ 
  position = 'bottom-right',
  showInProduction = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const {
    isMonitoring,
    performanceMetrics,
    errors,
    networkStatus,
    isSlowConnection,
    startMonitoring,
    stopMonitoring,
  } = useApplicationMonitoring();

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const getStatusColor = () => {
    if (!isMonitoring) return 'bg-gray-500';
    if (errors.length > 0) return 'bg-red-500';
    if (isSlowConnection) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPerformanceStatus = () => {
    if (!performanceMetrics) return 'Unknown';
    
    const loadTime = performanceMetrics.pageLoadTime;
    if (loadTime < 1000) return 'Excellent';
    if (loadTime < 2000) return 'Good';
    if (loadTime < 3000) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-80`}>
      <Card className="shadow-lg border-2">
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
              <span className="text-sm font-medium">Monitor</span>
              <Badge variant="outline" className="text-xs">
                {process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quick Status */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>{isMonitoring ? 'Active' : 'Inactive'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              <span className="capitalize">{networkStatus}</span>
            </div>
            
            {errors.length > 0 && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.length}</span>
              </div>
            )}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-3 border-t pt-3">
              {/* Performance Metrics */}
              {performanceMetrics && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-3 w-3" />
                    <span className="text-xs font-medium">Performance: {getPerformanceStatus()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Load Time:</span>
                      <div className="font-mono">{Math.round(performanceMetrics.pageLoadTime)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">FCP:</span>
                      <div className="font-mono">{Math.round(performanceMetrics.firstContentfulPaint)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TTFB:</span>
                      <div className="font-mono">{Math.round(performanceMetrics.timeToFirstByte)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory:</span>
                      <div className="font-mono">{(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Network Status */}
              <div className="flex items-center justify-between text-xs">
                <span>Network Status:</span>
                <div className="flex items-center gap-1">
                  <span className="capitalize">{networkStatus}</span>
                  {isSlowConnection && (
                    <Badge variant="secondary" className="text-xs">Slow</Badge>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  className="flex-1 text-xs h-7"
                >
                  {isMonitoring ? 'Stop' : 'Start'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/monitoring', '_blank')}
                  className="text-xs h-7"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringWidget;
