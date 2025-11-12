import React from 'react';
import { cn } from '@/lib/utils';

interface IslamicPatternProps {
  variant?: 'border' | 'background' | 'divider' | 'card' | 'gradient';
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'gold' | 'teal';
  children?: React.ReactNode;
  intensity?: 'light' | 'medium' | 'strong';
}

const IslamicPattern = ({
  variant = 'border',
  className,
  color = 'primary',
  children,
  intensity = 'medium',
}: IslamicPatternProps) => {
  // Map colors to Tailwind classes
  const colorClasses = {
    primary: 'text-primary border-primary/20 dark:text-white dark:border-white/20',
    secondary:
      'text-secondary border-secondary/20 dark:text-islamic-gold dark:border-islamic-gold/20',
    accent:
      'text-accent border-accent/20 dark:text-islamic-darkCream dark:border-islamic-darkCream/20',
    gold: 'text-islamic-brightGold border-islamic-brightGold/20 dark:text-islamic-darkBrightGold dark:border-islamic-darkBrightGold/20',
    teal: 'text-islamic-teal border-islamic-teal/20 dark:text-islamic-darkTeal dark:border-islamic-darkTeal/20',
  };

  const getPatternClass = () => {
    const baseClasses = 'relative';

    switch (variant) {
      case 'border':
        return cn(
          baseClasses,
          `border-2 rounded-lg p-4 ${colorClasses[color]} dark:bg-islamic-darkCard/30`,
          className
        );
      case 'background':
        return cn(baseClasses, `${colorClasses[color]} dark:bg-islamic-darkCard/30`, className);
      case 'divider':
        return cn(
          baseClasses,
          `h-8 bg-gradient-to-r from-transparent via-${color === 'gold' ? 'islamic-brightGold' : 'islamic-teal'}/30 to-transparent my-6 ${colorClasses[color]} dark:via-${color === 'gold' ? 'islamic-darkBrightGold' : 'islamic-darkTeal'}/40`,
          className
        );
      case 'card':
        return cn(
          baseClasses,
          `bg-white shadow-md border border-${color === 'gold' ? 'islamic-brightGold' : 'islamic-teal'}/10 rounded-lg ${colorClasses[color]} dark:bg-islamic-darkCard dark:border-${color === 'gold' ? 'islamic-darkBrightGold' : 'islamic-darkTeal'}/20`,
          className
        );
      case 'gradient':
        return cn(
          baseClasses,
          `bg-gradient-to-br from-islamic-teal/5 to-islamic-brightGold/10 border border-${color === 'gold' ? 'islamic-brightGold' : 'islamic-teal'}/10 rounded-lg ${colorClasses[color]} dark:from-islamic-darkTeal/20 dark:to-islamic-darkBrightGold/30 dark:border-${color === 'gold' ? 'islamic-darkBrightGold' : 'islamic-darkTeal'}/20`,
          className
        );
      default:
        return cn(baseClasses, className);
    }
  };

  return (
    <div className={getPatternClass()}>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export { IslamicPattern };
