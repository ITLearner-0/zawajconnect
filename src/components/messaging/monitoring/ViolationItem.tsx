
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
        return <AlertOctagon className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'low':
        return <Flag className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = () => {
    switch (violation.severity) {
      case 'high': return 'bg-red-100/90 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600/50';
      case 'medium': return 'bg-amber-100/90 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-600/50';
      case 'low': return 'bg-blue-100/90 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600/50';
      default: return 'bg-gray-100/90 text-gray-800 border-gray-300 dark:bg-gray-800/70 dark:text-gray-300 dark:border-gray-600/50';
    }
  };

  return (
    <li className={`p-4 rounded-lg border-2 shadow-md ${getSeverityColor()}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">{getSeverityIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-base">{violation.type}</h4>
            <Badge variant="outline" className={`ml-2 font-medium px-2.5 py-0.5 ${
              violation.severity === 'high' ? 'text-red-600 border-red-300 dark:text-red-300 dark:border-red-600/60 bg-red-50 dark:bg-red-900/40' :
              violation.severity === 'medium' ? 'text-amber-600 border-amber-300 dark:text-amber-300 dark:border-amber-600/60 bg-amber-50 dark:bg-amber-900/40' :
              'text-blue-600 border-blue-300 dark:text-blue-300 dark:border-blue-600/60 bg-blue-50 dark:bg-blue-900/40'
            }`}>
              {violation.severity}
            </Badge>
          </div>
          <p className="text-sm mt-2 font-medium">{violation.message}</p>
          {violation.metadata && violation.metadata.context && (
            <div className="mt-3 text-xs p-3 bg-white/90 rounded-md border-2 border-islamic-teal/30 dark:bg-islamic-darkCard/70 dark:border-islamic-darkTeal/40">
              <span className="font-bold">Context:</span> {violation.metadata.context}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ViolationItem;
