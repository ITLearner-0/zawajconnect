
import React from 'react';
import { Shield, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MonitoringHeaderProps {
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  onClose: () => void;
}

const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({ 
  monitoringEnabled,
  toggleMonitoring,
  onClose
}) => {
  return (
    <div className="flex justify-between items-center p-4">
      <div>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          AI Monitoring Dashboard
        </CardTitle>
        <CardDescription>
          Islamic compliance and behavior analysis
        </CardDescription>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="monitoring-toggle">
          {monitoringEnabled ? "Monitoring Active" : "Monitoring Paused"}
        </Label>
        <Switch
          id="monitoring-toggle"
          checked={monitoringEnabled}
          onCheckedChange={toggleMonitoring}
        />
        <Button variant="ghost" size="sm" onClick={onClose} className="ml-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MonitoringHeader;
