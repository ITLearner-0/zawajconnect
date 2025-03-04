
import React from 'react';
import { MonitoringReport } from '@/services/aiMonitoringService';
import { Progress } from "@/components/ui/progress";

interface MonitoringSummaryProps {
  report: MonitoringReport | null;
  loading: boolean;
}

const MonitoringSummary: React.FC<MonitoringSummaryProps> = ({ report, loading }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return <div className="text-center py-4">Loading analysis...</div>;
  }

  if (!report) {
    return (
      <div className="text-center py-4">
        Analysis will appear after more messages
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span>Islamic Compliance</span>
            <span className={getScoreColor(report.islamicComplianceScore)}>
              {report.islamicComplianceScore}%
            </span>
          </div>
          <Progress value={report.islamicComplianceScore} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Behavioral Analysis</span>
            <span className={getScoreColor(report.behavioralScore)}>
              {report.behavioralScore}%
            </span>
          </div>
          <Progress value={report.behavioralScore} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Sentiment Analysis</span>
            <span className={getScoreColor(report.sentimentScore)}>
              {report.sentimentScore}%
            </span>
          </div>
          <Progress value={report.sentimentScore} className="h-2" />
        </div>
      </div>
      
      <div className="pt-2 text-sm text-gray-500">
        Last updated: {new Date(report.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MonitoringSummary;
