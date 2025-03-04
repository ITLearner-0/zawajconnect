
import React from 'react';
import { MonitoringReport } from '@/services/aiMonitoringService';
import { BarChart, MessageSquare } from 'lucide-react';

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
        <div className="border rounded-md p-3 text-center">
          <div className="text-2xl font-bold mb-1 text-primary">
            {report.islamicComplianceScore}%
          </div>
          <div className="text-sm text-gray-500">
            Islamic Compliance
          </div>
        </div>
        <div className="border rounded-md p-3 text-center">
          <div className="text-2xl font-bold mb-1 text-primary">
            {report.behavioralScore}%
          </div>
          <div className="text-sm text-gray-500">
            Behavioral Score
          </div>
        </div>
        <div className="border rounded-md p-3 text-center">
          <div className="text-2xl font-bold mb-1 text-primary">
            {report.sentimentScore}%
          </div>
          <div className="text-sm text-gray-500">
            Sentiment Score
          </div>
        </div>
      </div>
      
      <div className="border rounded-md p-3">
        <h4 className="font-medium mb-2 flex items-center">
          <BarChart className="h-4 w-4 mr-2" />
          Analysis Summary
        </h4>
        <p className="text-sm text-gray-600">
          {report.violations.length === 0 
            ? "This conversation appears to be following Islamic guidelines. No significant issues detected." 
            : `This conversation has ${report.violations.length} violation(s) that may need attention.`
          }
          {report.islamicComplianceScore < 70 && " The Islamic compliance score is concerning."}
          {report.behavioralScore < 70 && " The behavioral patterns may need moderation."}
          {report.sentimentScore < 40 && " The conversation tone is becoming negative."}
        </p>
      </div>
      
      <div className="border rounded-md p-3">
        <h4 className="font-medium mb-2 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Recommendations
        </h4>
        <ul className="text-sm text-gray-600 space-y-2">
          {report.islamicComplianceScore < 80 && (
            <li>• Review Islamic guidelines for appropriate conversation topics</li>
          )}
          {report.behavioralScore < 80 && (
            <li>• Consider more thoughtful and measured communication pace</li>
          )}
          {report.sentimentScore < 50 && (
            <li>• Try to maintain a positive and respectful tone</li>
          )}
          {report.violations.length > 0 && (
            <li>• Address the specific violations noted in the Violations tab</li>
          )}
          {report.violations.some(v => v.severity === 'high') && (
            <li className="text-red-600">• Immediate attention needed for high severity violations</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DetailedReport;
