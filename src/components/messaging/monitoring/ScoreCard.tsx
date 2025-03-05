
import React from 'react';

interface ScoreCardProps {
  score: number;
  label: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, label }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="border-2 border-islamic-brightGold/40 dark:border-islamic-darkBrightGold/50 rounded-lg p-4 text-center bg-white/80 dark:bg-islamic-darkCard/80 shadow-md">
      <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div className="text-sm font-medium text-islamic-burgundy dark:text-islamic-cream">
        {label}
      </div>
    </div>
  );
};

export default ScoreCard;
