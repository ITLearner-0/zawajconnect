
import React from 'react';
import { Violation } from '@/services/aiMonitoringService';
import { AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ViolationItemProps {
  violation: Violation;
}

const ViolationItem: React.FC<ViolationItemProps> = ({ violation }) => {
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
          <span className="font-medium">{violation.message}</span>
        </div>
        <Badge className={getSeverityColor(violation.severity)}>
          {violation.severity}
        </Badge>
      </div>
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span className="capitalize">{violation.type} violation</span>
        <span>{new Date(violation.timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ViolationItem;
