import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

interface RecommendationItemProps {
  text: string;
  severity?: 'low' | 'medium' | 'high';
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ text, severity = 'low' }) => {
  const getIcon = () => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-300 flex-shrink-0" />;
      case 'medium':
        return (
          <Lightbulb className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold/90 flex-shrink-0" />
        );
      case 'low':
      default:
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-300 flex-shrink-0" />;
    }
  };

  const getItemStyle = () => {
    switch (severity) {
      case 'high':
        return 'border-red-400/70 dark:border-red-500/80 bg-white dark:bg-red-950/70 text-red-700 dark:text-red-200';
      case 'medium':
        return 'border-islamic-brightGold/60 dark:border-islamic-darkBrightGold bg-white dark:bg-amber-950/70 text-islamic-burgundy dark:text-amber-200';
      default:
        return 'border-green-400/60 dark:border-green-500/80 bg-white dark:bg-green-950/70 text-islamic-teal dark:text-green-200';
    }
  };

  return (
    <li
      className={`flex items-start gap-3 mb-3 p-3.5 rounded-md border-2 ${getItemStyle()} shadow-sm dark:shadow-black/30`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <span className="text-sm font-medium">{text}</span>
    </li>
  );
};

export default RecommendationItem;
