
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gauge, Minimize2, Maximize2 } from 'lucide-react';

interface PerformanceWidgetHeaderProps {
  isTracking: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const PerformanceWidgetHeader: React.FC<PerformanceWidgetHeaderProps> = ({
  isTracking,
  isExpanded,
  onToggleExpand,
}) => {
  return (
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
          onClick={onToggleExpand}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
};

export default PerformanceWidgetHeader;
