
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
    <div className="border border-islamic-brightGold/30 dark:border-islamic-darkBrightGold/40 rounded-md p-3 text-center bg-white/70 dark:bg-islamic-darkCard/70 shadow-sm">
      <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div className="text-sm text-islamic-burgundy/90 dark:text-islamic-cream/80">
        {label}
      </div>
    </div>
  );
};

export default ScoreCard;
