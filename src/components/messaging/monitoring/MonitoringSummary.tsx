
import React from 'react';
import { MonitoringReport } from '@/services/aiMonitoringService';
import ScoreIndicator from './ScoreIndicator';

interface MonitoringSummaryProps {
  report: MonitoringReport | null;
  loading: boolean;
}

const MonitoringSummary: React.FC<MonitoringSummaryProps> = ({ report, loading }) => {
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
        <ScoreIndicator 
          label="Islamic Compliance" 
          score={report.islamicComplianceScore} 
        />
        
        <ScoreIndicator 
          label="Behavioral Analysis" 
          score={report.behavioralScore} 
        />
        
        <ScoreIndicator 
          label="Sentiment Analysis" 
          score={report.sentimentScore} 
        />
      </div>
      
      <div className="pt-2 text-sm text-gray-500">
        Last updated: {new Date(report.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MonitoringSummary;
