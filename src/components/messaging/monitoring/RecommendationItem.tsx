
import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

interface RecommendationItemProps {
  text: string;
  severity?: 'low' | 'medium' | 'high';
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ 
  text, 
  severity = 'low' 
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />;
      case 'medium':
        return <Lightbulb className="h-5 w-5 text-islamic-brightGold dark:text-islamic-gold flex-shrink-0" />;
      case 'low':
      default:
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />;
    }
  };

  const getTextColor = () => {
    switch (severity) {
      case 'high':
        return 'text-red-700 dark:text-red-300';
      case 'medium':
        return 'text-islamic-burgundy dark:text-islamic-brightGold';
      default:
        return 'text-islamic-teal dark:text-islamic-cream';
    }
  };

  return (
    <li className={`flex items-start gap-3 mb-3 p-2 rounded-md border border-islamic-brightGold/20 dark:border-islamic-darkBrightGold/30 bg-white/60 dark:bg-islamic-darkCard/60 ${getTextColor()}`}>
      <div className="mt-0.5">{getIcon()}</div>
      <span className="text-sm font-medium">{text}</span>
    </li>
  );
};

export default RecommendationItem;
