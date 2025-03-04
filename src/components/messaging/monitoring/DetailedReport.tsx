
import React from 'react';
import { MonitoringReport } from '@/services/aiMonitoringService';
import ScoreCard from './ScoreCard';
import AnalysisSummary from './AnalysisSummary';
import RecommendationsSection from './RecommendationsSection';

interface DetailedReportProps {
  report: MonitoringReport | null;
}

const DetailedReport: React.FC<DetailedReportProps> = ({ report }) => {
  if (!report) {
    return (
      <div className="text-center py-8 text-gray-500">
        Detailed report will be generated after more messages
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard 
          score={report.islamicComplianceScore} 
          label="Islamic Compliance" 
        />
        <ScoreCard 
          score={report.behavioralScore} 
          label="Behavioral Score" 
        />
        <ScoreCard 
          score={report.sentimentScore} 
          label="Sentiment Score" 
        />
      </div>
      
      <AnalysisSummary report={report} />
      <RecommendationsSection report={report} />
    </div>
  );
};

export default DetailedReport;
