
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw } from 'lucide-react';

interface PerformanceWidgetControlsProps {
  isTracking: boolean;
  isExpanded: boolean;
  onToggleTracking: () => void;
  onClearMetrics: () => void;
}

const PerformanceWidgetControls: React.FC<PerformanceWidgetControlsProps> = ({
  isTracking,
  isExpanded,
  onToggleTracking,
  onClearMetrics,
}) => {
  if (!isExpanded) {
    return (
      <div className="flex gap-1 mt-2">
        <Button
          variant={isTracking ? "destructive" : "default"}
          size="sm"
          onClick={onToggleTracking}
          className="flex-1 text-xs h-6"
        >
          {isTracking ? 'Stop' : 'Start'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearMetrics}
          className="text-xs h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-3 pt-2 border-t">
      <Button
        variant={isTracking ? "destructive" : "default"}
        size="sm"
        onClick={onToggleTracking}
        className="flex-1 text-xs h-7"
      >
        <Zap className="h-3 w-3 mr-1" />
        {isTracking ? 'Stop' : 'Start'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClearMetrics}
        className="text-xs h-7"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default PerformanceWidgetControls;
