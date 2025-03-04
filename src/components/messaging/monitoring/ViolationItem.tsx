
import React, { useState } from 'react';
import { Violation } from '@/services/aiMonitoringService';
import { ChevronDown, ChevronUp, AlertTriangle, AlertOctagon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViolationItemProps {
  violation: Violation;
}

const ViolationItem: React.FC<ViolationItemProps> = ({ violation }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertOctagon className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <li className={`rounded-md border p-3 ${getSeverityColor(violation.severity)}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          {getSeverityIcon(violation.severity)}
          <div>
            <h4 className="font-medium">{violation.message}</h4>
            {expanded && (
              <div className="mt-2 text-sm">
                <p className="mb-2">{violation.message}</p>
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="ml-2 p-1 h-7">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
    </li>
  );
};

export default ViolationItem;
