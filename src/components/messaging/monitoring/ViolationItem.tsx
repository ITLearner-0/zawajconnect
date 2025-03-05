
import React from 'react';
import { Violation } from '@/services/monitoring/types';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertOctagon, Flag } from 'lucide-react';

interface ViolationItemProps {
  violation: Violation;
}

const ViolationItem: React.FC<ViolationItemProps> = ({ violation }) => {
  const getSeverityIcon = () => {
    switch (violation.severity) {
      case 'high':
        return <AlertOctagon className="h-5 w-5 text-red-500 dark:text-red-300" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-300" />;
      case 'low':
        return <Flag className="h-5 w-5 text-blue-500 dark:text-blue-300" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = () => {
    switch (violation.severity) {
      case 'high': return 'bg-red-100/95 text-red-800 border-red-400 dark:bg-red-900/60 dark:text-red-200 dark:border-red-600/80';
      case 'medium': return 'bg-amber-100/95 text-amber-800 border-amber-400 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-600/80';
      case 'low': return 'bg-blue-100/95 text-blue-800 border-blue-400 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-600/80';
      default: return 'bg-gray-100/95 text-gray-800 border-gray-400 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-600/80';
    }
  };
  
  const getBadgeColor = () => {
    switch (violation.severity) {
      case 'high': return 'text-white bg-red-600 border-red-400 dark:text-white dark:border-red-400 dark:bg-red-700';
      case 'medium': return 'text-black bg-amber-400 border-amber-500 dark:text-black dark:border-amber-400 dark:bg-amber-400';
      case 'low': return 'text-white bg-blue-600 border-blue-400 dark:text-white dark:border-blue-400 dark:bg-blue-600';
      default: return 'text-gray-600 border-gray-300 dark:text-gray-300 dark:border-gray-600/60 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <li className={`p-4 rounded-lg border-2 shadow-md ${getSeverityColor()}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">{getSeverityIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-base">{violation.type}</h4>
            <Badge className={`ml-2 font-medium px-2.5 py-0.5 ${getBadgeColor()}`}>
              {violation.severity}
            </Badge>
          </div>
          <p className="text-sm mt-2 font-medium">{violation.message}</p>
          {violation.metadata && violation.metadata.context && (
            <div className="mt-3 text-xs p-3 bg-white/95 rounded-md border-2 border-islamic-teal/40 dark:bg-black/40 dark:border-islamic-darkTeal/60 dark:text-white">
              <span className="font-bold">Context:</span> {violation.metadata.context}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ViolationItem;
