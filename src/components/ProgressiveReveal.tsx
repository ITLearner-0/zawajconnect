import React, { useEffect, useState, ReactNode } from 'react';
import useAnimationSequence from '@/hooks/useAnimationSequence';

interface RevealItem {
  id: string;
  content: ReactNode;
  delay?: number;
  animation?: string;
}

interface ProgressiveRevealProps {
  items: RevealItem[];
  staggerDelay?: number;
  trigger?: boolean;
  onComplete?: () => void;
  className?: string;
}

const ProgressiveReveal: React.FC<ProgressiveRevealProps> = ({
  items,
  staggerDelay = 200,
  trigger = true,
  onComplete,
  className = ''
}) => {
  const animationSteps = items.map((item, index) => ({
    id: item.id,
    delay: (item.delay || 0) + (index * staggerDelay),
    className: item.animation || 'animate-fade-in animate-slide-up'
  }));

  const { getStepClassName, isComplete } = useAnimationSequence({
    steps: animationSteps,
    trigger
  });

  useEffect(() => {
    if (isComplete) {
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  return (
    <div className={className}>
      {items.map((item) => (
        <div
          key={item.id}
          className={getStepClassName(
            item.id,
            'transition-all duration-500 ease-out'
          )}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default ProgressiveReveal;