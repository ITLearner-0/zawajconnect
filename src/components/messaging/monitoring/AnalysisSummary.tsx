
import React from 'react';
import { MonitoringReport } from '@/services/monitoring';  // Updated import path
import { formatDistanceToNow } from 'date-fns';

interface AnalysisSummaryProps {
  report: MonitoringReport;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ report }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Analysis Summary</h3>
      <p className="text-sm text-gray-600">
        This analysis was performed {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-700">Messages Analyzed</p>
          <p>{report.violations?.length || 0}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Time Period</p>
          <p>Recent messages</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Content Rating</p>
          <p className={`font-medium ${
            report.behavioralScore < 60 ? 'text-red-600' : 
            report.behavioralScore < 80 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {report.behavioralScore < 60 ? 'Problematic' : 
             report.behavioralScore < 80 ? 'Concerning' : 'Safe'}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Overall Score</p>
          <p className={`font-medium ${
            (report.behavioralScore + report.islamicComplianceScore + report.sentimentScore) / 3 >= 80 ? 'text-green-600' : 
            (report.behavioralScore + report.islamicComplianceScore + report.sentimentScore) / 3 >= 60 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {Math.round((report.behavioralScore + report.islamicComplianceScore + report.sentimentScore) / 3)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummary;
