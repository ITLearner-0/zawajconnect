
import React from 'react';
import { BarChart } from 'lucide-react';
import { MonitoringReport } from '@/services/aiMonitoringService';

interface AnalysisSummaryProps {
  report: MonitoringReport;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ report }) => {
  const getSummaryText = () => {
    let text = '';
    
    if (report.violations.length === 0) {
      text = "This conversation appears to be following Islamic guidelines. No significant issues detected.";
    } else {
      text = `This conversation has ${report.violations.length} violation(s) that may need attention.`;
    }
    
    if (report.islamicComplianceScore < 70) {
      text += " The Islamic compliance score is concerning.";
    }
    
    if (report.behavioralScore < 70) {
      text += " The behavioral patterns may need moderation.";
    }
    
    if (report.sentimentScore < 40) {
      text += " The conversation tone is becoming negative.";
    }
    
    return text;
  };

  return (
    <div className="border rounded-md p-3">
      <h4 className="font-medium mb-2 flex items-center">
        <BarChart className="h-4 w-4 mr-2" />
        Analysis Summary
      </h4>
      <p className="text-sm text-gray-600">
        {getSummaryText()}
      </p>
    </div>
  );
};

export default AnalysisSummary;
