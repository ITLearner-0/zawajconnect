
import React from 'react';

interface ScoreCardProps {
  score: number;
  label: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, label }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-300 font-bold";
    if (score >= 60) return "text-amber-600 dark:text-amber-300 font-bold";
    return "text-red-600 dark:text-red-300 font-bold";
  };

  return (
    <div className="border-2 border-islamic-brightGold/70 dark:border-islamic-darkBrightGold rounded-lg p-4 text-center bg-white dark:bg-islamic-darkCard shadow-md dark:shadow-black/30">
      <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div className="text-sm font-medium text-islamic-burgundy dark:text-gray-200">
        {label}
      </div>
    </div>
  );
};

export default ScoreCard;
