
import React from 'react';
import { CardFooter } from "@/components/ui/card";

interface MonitoringFooterProps {
  report: any;
}

const MonitoringFooter: React.FC<MonitoringFooterProps> = ({ report }) => {
  return (
    <CardFooter className="flex justify-between text-xs text-gray-500 p-4 border-t">
      <div>AI-powered monitoring for Islamic compliance</div>
      {report && <div>Report ID: {report.timestamp?.substring(0, 10)}</div>}
    </CardFooter>
  );
};

export default MonitoringFooter;
