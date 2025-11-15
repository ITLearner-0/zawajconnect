import React from 'react';
import { CardFooter } from '@/components/ui/card';

interface MonitoringFooterProps {
  report: any;
}

const MonitoringFooter: React.FC<MonitoringFooterProps> = ({ report }) => {
  return (
    <CardFooter className="flex justify-between text-xs text-rose-500 dark:text-rose-400 p-4 border-t border-rose-200 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/50">
      <div>AI-powered monitoring for Islamic compliance</div>
      {report && <div>Report ID: {report.timestamp?.substring(0, 10)}</div>}
    </CardFooter>
  );
};

export default MonitoringFooter;
