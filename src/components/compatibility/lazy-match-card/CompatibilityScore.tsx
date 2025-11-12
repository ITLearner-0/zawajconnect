import React from 'react';
import { Progress } from '@/components/ui/progress';
import { APP_CONSTANTS, formatters } from '@/utils/helpers';

interface CompatibilityScoreProps {
  score: number;
}

const CompatibilityScore = ({ score }: CompatibilityScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= APP_CONSTANTS.COMPATIBILITY.EXCELLENT_THRESHOLD) return 'bg-green-500';
    if (score >= APP_CONSTANTS.COMPATIBILITY.GOOD_THRESHOLD) return 'bg-blue-500';
    if (score >= APP_CONSTANTS.COMPATIBILITY.FAIR_THRESHOLD) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= APP_CONSTANTS.COMPATIBILITY.EXCELLENT_THRESHOLD) return 'text-green-600';
    if (score >= APP_CONSTANTS.COMPATIBILITY.GOOD_THRESHOLD) return 'text-blue-600';
    if (score >= APP_CONSTANTS.COMPATIBILITY.FAIR_THRESHOLD) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-right ml-4" role="group" aria-label="Compatibility score">
      <div className="flex items-center">
        <Progress
          value={score}
          className="w-24 h-2 mr-2"
          indicatorClassName={getScoreColor(score)}
          aria-label={`Compatibility score: ${score} percent`}
        />
        <span className={`font-semibold ${getTextColor(score)}`}>
          {formatters.percentage(score, 0)}
        </span>
      </div>
    </div>
  );
};

export default CompatibilityScore;
