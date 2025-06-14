
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, Download } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onToggle: (show: boolean) => void;
}

const DashboardHeader = ({ onRefresh, onExport, onToggle }: DashboardHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Lazy Loading Analytics
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onToggle(false)}>
            ×
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default DashboardHeader;
