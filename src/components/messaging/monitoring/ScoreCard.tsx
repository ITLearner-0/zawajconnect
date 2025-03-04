
import React from 'react';

interface ScoreCardProps {
  score: number;
  label: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, label }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="border rounded-md p-3 text-center">
      <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div className="text-sm text-gray-500">
        {label}
      </div>
    </div>
  );
};

export default ScoreCard;
