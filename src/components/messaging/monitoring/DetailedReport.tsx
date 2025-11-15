import React from 'react';
import { MonitoringReport } from '@/services/monitoring'; // Updated import path
import ViolationsList from './ViolationsList';
import RecommendationsSection from './RecommendationsSection';
import AnalysisSummary from './AnalysisSummary';

interface DetailedReportProps {
  report: MonitoringReport;
}

const DetailedReport: React.FC<DetailedReportProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-6 p-4">
      <AnalysisSummary report={report} />

      {report.violations && report.violations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-red-600">Detected Issues</h3>
          <ViolationsList violations={report.violations} />
        </div>
      )}

      <RecommendationsSection report={report} />
    </div>
  );
};

export default DetailedReport;
