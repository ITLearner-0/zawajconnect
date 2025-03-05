
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
        return <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case 'medium':
        return <Lightbulb className="h-4 w-4 text-islamic-brightGold dark:text-islamic-gold flex-shrink-0" />;
      case 'low':
      default:
        return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    }
  };

  const getTextColor = () => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-islamic-burgundy dark:text-islamic-brightGold';
      default:
        return 'text-islamic-teal dark:text-islamic-cream/90';
    }
  };

  return (
    <li className={`flex items-start gap-2 mb-2 ${getTextColor()}`}>
      {getIcon()}
      <span className="text-sm">{text}</span>
    </li>
  );
};

export default RecommendationItem;
