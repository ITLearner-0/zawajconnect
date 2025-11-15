import React from 'react';
import { MonitoringReport } from '@/services/monitoring'; // Updated import path
import RecommendationItem from './RecommendationItem';

interface RecommendationsSectionProps {
  report: MonitoringReport;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ report }) => {
  // Use the recommendations from the report if available, otherwise generate them
  const recommendations =
    report.recommendations && report.recommendations.length > 0
      ? report.recommendations.map((text) => ({ text, severity: 'low' as const }))
      : getRecommendationsFromViolations(report);

  // Generate recommendations based on violations
  function getRecommendationsFromViolations(report: MonitoringReport) {
    if (!report.violations || report.violations.length === 0) {
      return [];
    }

    // Generate recommendations from violations
    return report.violations.map((violation) => ({
      text: `Consider addressing: ${violation.message}`,
      severity: violation.severity,
    }));
  }

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
