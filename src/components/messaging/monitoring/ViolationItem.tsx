
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
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <Flag className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = () => {
    switch (violation.severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/30';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/30';
    }
  };

  return (
    <li className={`p-3 rounded-md border ${getSeverityColor()}`}>
      <div className="flex items-start">
        <div className="mr-2 mt-1">{getSeverityIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{violation.type}</h4>
            <Badge variant="outline" className={`ml-2 ${
              violation.severity === 'high' ? 'text-red-500 border-red-200 dark:text-red-400 dark:border-red-700/30' :
              violation.severity === 'medium' ? 'text-amber-500 border-amber-200 dark:text-amber-400 dark:border-amber-700/30' :
              'text-blue-500 border-blue-200 dark:text-blue-400 dark:border-blue-700/30'
            }`}>
              {violation.severity}
            </Badge>
          </div>
          <p className="text-sm mt-1">{violation.message}</p>
          {violation.metadata && violation.metadata.context && (
            <div className="mt-2 text-xs p-2 bg-white/70 rounded border border-islamic-teal/10 dark:bg-islamic-darkCard/50 dark:border-islamic-darkTeal/20">
              <span className="font-medium">Context:</span> {violation.metadata.context}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ViolationItem;
