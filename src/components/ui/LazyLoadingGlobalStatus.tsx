
import React from 'react';
import { useLazyLoadingState, useLazyLoadingActions } from '@/hooks/useLazyLoading/context/LazyLoadingContext';
import { useBatchLoading } from '@/hooks/useLazyLoading/state/useBatchLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Settings, Activity, TrendingUp } from 'lucide-react';

interface LazyLoadingGlobalStatusProps {
  showAdvanced?: boolean;
  className?: string;
}

const LazyLoadingGlobalStatus = ({ 
  showAdvanced = false, 
  className 
}: LazyLoadingGlobalStatusProps) => {
  const state = useLazyLoadingState();
  const actions = useLazyLoadingActions();
  const { getBatchStatus, updateBatchSize } = useBatchLoading();

  const batchStatus = getBatchStatus();
  
  const successRate = state.totalImages > 0 
    ? (state.loadedImages / state.totalImages) * 100 
    : 0;

  const loadingProgress = state.totalImages > 0
    ? ((state.loadedImages + state.failedImages) / state.totalImages) * 100
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Lazy Loading Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Total Images</div>
            <div className="text-muted-foreground">{state.totalImages}</div>
          </div>
          <div>
            <div className="font-medium">Success Rate</div>
            <div className="text-muted-foreground">{successRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="font-medium">Queue Length</div>
            <div className="text-muted-foreground">{state.loadingQueue.length}</div>
          </div>
          <div>
            <div className="font-medium">Avg Load Time</div>
            <div className="text-muted-foreground">{state.averageLoadTime.toFixed(0)}ms</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Loading Progress</span>
            <span>{state.loadedImages}/{state.totalImages}</span>
          </div>
          <Progress value={loadingProgress} className="h-2" />
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {state.isGlobalLoading && (
            <Badge variant="default" className="bg-blue-500">
              Loading
            </Badge>
          )}
          {state.networkOptimization && (
            <Badge variant="secondary">
              Network Optimized
            </Badge>
          )}
          {state.memoryOptimization && (
            <Badge variant="secondary">
              Memory Optimized
            </Badge>
          )}
          {state.enableAnalytics && (
            <Badge variant="outline">
              Analytics
            </Badge>
          )}
        </div>

        {/* Advanced Status */}
        {showAdvanced && (
          <>
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-medium">Batch Loading</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium">Batch Size</div>
                  <div className="text-muted-foreground">{batchStatus.batchSize}</div>
                </div>
                <div>
                  <div className="font-medium">Est. Batches</div>
                  <div className="text-muted-foreground">{batchStatus.estimatedBatches}</div>
                </div>
              </div>
              
              {batchStatus.isProcessing && (
                <Badge variant="default" className="bg-green-500">
                  Processing Batch
                </Badge>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-medium">Configuration</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium">Preload Distance</div>
                  <div className="text-muted-foreground">{state.preloadDistance}px</div>
                </div>
                <div>
                  <div className="font-medium">Max Retries</div>
                  <div className="text-muted-foreground">{state.maxRetries}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={actions.clearCache}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear Cache
          </Button>
          
          {showAdvanced && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateBatchSize(state.batchSize === 10 ? 5 : 10)}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Batch Size
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LazyLoadingGlobalStatus;
