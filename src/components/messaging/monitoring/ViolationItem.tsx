
import React from 'react';
import { Violation } from '@/services/aiMonitoringService';
import { AlertTriangle, AlertOctagon, AlertCircle } from 'lucide-react';

interface ViolationItemProps {
  violation: Violation;
}

const ViolationItem: React.FC<ViolationItemProps> = ({ violation }) => {
  const getIcon = () => {
    switch (violation.severity) {
      case 'high':
        return <AlertOctagon className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
      case 'low':
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getSeverityClass = () => {
    switch (violation.severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'low':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <li className={`p-3 rounded-md border ${getSeverityClass()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="space-y-1">
          <p className="font-medium">{violation.type}</p>
          <p className="text-sm">{violation.description}</p>
          {violation.message_excerpts && violation.message_excerpts.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Message excerpts:</p>
              <ul className="space-y-1 text-xs">
                {violation.message_excerpts.map((excerpt, index) => (
                  <li key={index} className="bg-white/50 p-1 rounded">
                    "{excerpt}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ViolationItem;
