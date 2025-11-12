import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
  onComplete?: () => void;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 1000,
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0,
  onComplete
}) => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const startAnimation = () => {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = count;
      const difference = target - startValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (difference * easeOut);
        
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
          setIsAnimating(false);
          onComplete?.();
        }
      };

      if (delay > 0) {
        setTimeout(() => requestAnimationFrame(animate), delay);
      } else {
        requestAnimationFrame(animate);
      }
    };

    startAnimation();
  }, [target, duration, delay]);

  const formatNumber = (num: number): string => {
    return num.toFixed(decimals);
  };

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse-gentle' : ''}`}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;