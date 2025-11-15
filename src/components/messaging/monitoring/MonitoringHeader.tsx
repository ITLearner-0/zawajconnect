import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';

interface MonitoringHeaderProps {
  isEnabled: boolean;
  onToggleMonitoring: () => void;
  isLoading: boolean;
  onClose?: () => void;
}

const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({
  isEnabled,
  onToggleMonitoring,
  isLoading,
  onClose,
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Monitoring Dashboard</h3>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm mr-2">{isEnabled ? 'Enabled' : 'Disabled'}</span>

          <Switch checked={isEnabled} onCheckedChange={onToggleMonitoring} disabled={isLoading} />
        </div>

        {onClose && (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardHeader>
  );
};

export default MonitoringHeader;
