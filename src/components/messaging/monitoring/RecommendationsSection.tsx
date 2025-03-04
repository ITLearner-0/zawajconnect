
import React from 'react';
import { MonitoringReport } from '@/services/aiMonitoringService';
import RecommendationItem from './RecommendationItem';

interface RecommendationsSectionProps {
  report: MonitoringReport;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ report }) => {
  // Generate recommendations based on violations
  const getRecommendations = () => {
    if (!report.violations || report.violations.length === 0) {
      return [];
    }
    
    // Generate recommendations from violations
    return report.violations.map(violation => ({
      text: `Consider addressing: ${violation.message}`,
      severity: violation.severity
    }));
  };
  
  const recommendations = getRecommendations();
  
  // If no recommendations, don't render the section
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-blue-600">Recommendations</h3>
      <ul className="space-y-2">
        {recommendations.map((recommendation, index) => (
          <RecommendationItem 
            key={index} 
            text={recommendation.text} 
            severity={recommendation.severity} 
          />
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsSection;
