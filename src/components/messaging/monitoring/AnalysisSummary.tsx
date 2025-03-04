
import React from 'react';
import { MonitoringReport } from '@/services/aiMonitoringService';
import { formatDistanceToNow } from 'date-fns';

interface AnalysisSummaryProps {
  report: MonitoringReport;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ report }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Analysis Summary</h3>
      <p className="text-sm text-gray-600">
        This analysis was performed {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-700">Messages Analyzed</p>
          <p>{report.message_count}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Time Period</p>
          <p>{report.time_period || "Recent messages"}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Content Rating</p>
          <p className={`font-medium ${
            report.content_category === 'problematic' ? 'text-red-600' : 
            report.content_category === 'concerning' ? 'text-amber-600' : 'text-green-600'
          }`}>
            {report.content_category ? 
              report.content_category.charAt(0).toUpperCase() + report.content_category.slice(1) : 
              'Safe'}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Overall Score</p>
          <p className={`font-medium ${
            report.overall_score >= 80 ? 'text-green-600' : 
            report.overall_score >= 60 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {report.overall_score}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummary;
