import React from 'react';
import { MonitoringReport } from '@/services/monitoring'; // Updated import path
import ScoreCard from './ScoreCard';
import ScoreIndicator from './ScoreIndicator';
import { CircleAlert } from 'lucide-react';

interface MonitoringSummaryProps {
  report: MonitoringReport;
}

const MonitoringSummary: React.FC<MonitoringSummaryProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium">Conversation Health Summary</h3>

      <div className="flex justify-center mb-4">
        <ScoreIndicator
          score={report.behavioralScore + report.islamicComplianceScore + report.sentimentScore / 3}
          size="large"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ScoreCard score={report.behavioralScore} label="Behavior" />
        <ScoreCard score={report.islamicComplianceScore} label="Islamic Compliance" />
        <ScoreCard score={report.sentimentScore} label="Sentiment" />
      </div>

      {report.violations && report.violations.length > 0 && (
        <div className="mt-4 bg-red-50 p-3 rounded-md">
          <div className="flex items-center text-red-600 mb-2">
            <CircleAlert className="h-5 w-5 mr-2" />
            <h4 className="font-medium">Detected Issues</h4>
          </div>
          <p className="text-sm text-red-600">
            {report.violations.length} potential{' '}
            {report.violations.length === 1 ? 'issue' : 'issues'} detected
          </p>
        </div>
      )}
    </div>
  );
};

export default MonitoringSummary;
