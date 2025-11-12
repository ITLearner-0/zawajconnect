import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Download, Trash2, RefreshCw, Activity } from 'lucide-react';

interface DevPanelHeaderProps {
  onRefresh: () => void;
  onDownloadReport: () => void;
  onClearMetrics: () => void;
  onToggle: (show: boolean) => void;
}

const DevPanelHeader = ({
  onRefresh,
  onDownloadReport,
  onClearMetrics,
  onToggle,
}: DevPanelHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Lazy Loading Monitor
      </CardTitle>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDownloadReport}>
          <Download className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearMetrics}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onToggle(false)}>
          ×
        </Button>
      </div>
    </div>
  );
};

export default DevPanelHeader;
