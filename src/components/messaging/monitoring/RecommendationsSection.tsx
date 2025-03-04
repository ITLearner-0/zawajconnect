
import React from 'react';
import { MessageSquare } from 'lucide-react';
import RecommendationItem from './RecommendationItem';
import { MonitoringReport } from '@/services/aiMonitoringService';

interface RecommendationsSectionProps {
  report: MonitoringReport;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ report }) => {
  return (
    <div className="border rounded-md p-3">
      <h4 className="font-medium mb-2 flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        Recommendations
      </h4>
      <ul className="text-sm space-y-2">
        {report.islamicComplianceScore < 80 && (
          <RecommendationItem 
            text="Review Islamic guidelines for appropriate conversation topics"
            severity={report.islamicComplianceScore < 60 ? 'high' : 'medium'}
          />
        )}
        {report.behavioralScore < 80 && (
          <RecommendationItem 
            text="Consider more thoughtful and measured communication pace"
            severity={report.behavioralScore < 60 ? 'high' : 'medium'}
          />
        )}
        {report.sentimentScore < 50 && (
          <RecommendationItem 
            text="Try to maintain a positive and respectful tone"
            severity={report.sentimentScore < 30 ? 'high' : 'medium'}
          />
        )}
        {report.violations.length > 0 && (
          <RecommendationItem 
            text="Address the specific violations noted in the Violations tab"
            severity={report.violations.some(v => v.severity === 'high') ? 'high' : 'medium'}
          />
        )}
        {report.violations.some(v => v.severity === 'high') && (
          <RecommendationItem 
            text="Immediate attention needed for high severity violations"
            severity="high"
          />
        )}
      </ul>
    </div>
  );
};

export default RecommendationsSection;
