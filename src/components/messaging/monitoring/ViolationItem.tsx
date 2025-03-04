
import React from 'react';
import { Violation } from '@/services/monitoring';  // Updated import path
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ViolationItemProps {
  violation: Violation;
}

const ViolationItem: React.FC<ViolationItemProps> = ({ violation }) => {
  // Determine icon based on severity
  const IconComponent = 
    violation.severity === 'high' ? AlertCircle : 
    violation.severity === 'medium' ? AlertTriangle : 
    Info;

  // Determine color based on severity
  const severityColors = {
    high: 'text-red-500 bg-red-50',
    medium: 'text-amber-500 bg-amber-50',
    low: 'text-blue-500 bg-blue-50'
  };

  return (
    <li className={`p-3 rounded-md ${severityColors[violation.severity]}`}>
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{violation.message}</p>
          <p className="text-xs mt-1">
            {formatDistanceToNow(new Date(violation.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
    </li>
  );
};

export default ViolationItem;
