
import React from 'react';

interface ScoreCardProps {
  score: number;
  label: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, label }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 dark:text-green-400 font-bold";
    if (score >= 60) return "text-amber-500 dark:text-amber-300 font-bold";
    return "text-red-500 dark:text-red-400 font-bold";
  };

  return (
    <div className="border-2 border-islamic-brightGold/60 dark:border-islamic-darkBrightGold/80 rounded-lg p-4 text-center bg-white/90 dark:bg-islamic-darkCard/95 shadow-md dark:shadow-black/30">
      <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div className="text-sm font-medium text-islamic-burgundy dark:text-white">
        {label}
      </div>
    </div>
  );
};

export default ScoreCard;
