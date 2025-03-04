
import React from 'react';
import { Shield } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface MonitoringHeaderProps {
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
}

const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({ 
  monitoringEnabled,
  toggleMonitoring
}) => {
  return (
    <div className="flex justify-between items-center">
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
      </div>
    </div>
  );
};

export default MonitoringHeader;
