
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Signal, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ScoreIndicatorProps {
  score: number;
  label?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ 
  score, 
  label = '', 
  showIcon = true,
  size = 'medium'
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-islamic-brightGold dark:text-islamic-darkBrightGold";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600 dark:bg-green-500";
    if (score >= 60) return "bg-islamic-brightGold dark:bg-islamic-darkBrightGold";
    return "bg-red-600 dark:bg-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <ThumbsUp className={`${size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-green-600 dark:text-green-400`} />;
    if (score >= 60) return <Signal className={`${size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-islamic-brightGold dark:text-islamic-darkBrightGold`} />;
    return <AlertTriangle className={`${size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-red-600 dark:text-red-400`} />;
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-4xl font-bold'
  };

  // Large size has a different layout
  if (size === 'large') {
    return (
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} ${getScoreColor(score)} flex items-center gap-2 mb-2`}>
          {score}%
          {showIcon && getScoreIcon(score)}
        </div>
        {label && <div className="text-sm text-islamic-burgundy dark:text-islamic-cream/70 mb-1">{label}</div>}
        <Progress 
          value={score} 
          className="h-2 w-20 bg-islamic-teal/10 dark:bg-islamic-darkTeal/20" 
          indicatorClassName={getProgressColor(score)} 
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-1 items-center">
        {label && <span className="text-islamic-burgundy dark:text-islamic-cream/90">{label}</span>}
        <div className="flex items-center gap-1">
          <span className={getScoreColor(score)}>
            {score}%
          </span>
          {showIcon && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{getScoreIcon(score)}</span>
                </TooltipTrigger>
                <TooltipContent className="bg-white dark:bg-islamic-darkCard border-islamic-teal/20 dark:border-islamic-darkTeal/30">
                  {score >= 80 && "Good standing"}
                  {score >= 60 && score < 80 && "Needs attention"}
                  {score < 60 && "Critical issues detected"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <Progress 
        value={score} 
        className="h-2 bg-islamic-teal/10 dark:bg-islamic-darkTeal/20" 
        indicatorClassName={getProgressColor(score)} 
      />
    </div>
  );
};

export default ScoreIndicator;
