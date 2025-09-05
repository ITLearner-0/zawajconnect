import { useEffect, useState } from 'react';

interface AnimationStep {
  id: string;
  delay: number;
  duration?: number;
  className: string;
}

interface UseAnimationSequenceProps {
  steps: AnimationStep[];
  trigger?: boolean;
  autoStart?: boolean;
}

export const useAnimationSequence = ({ 
  steps, 
  trigger = true, 
  autoStart = true 
}: UseAnimationSequenceProps) => {
  const [activeSteps, setActiveSteps] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger || (!autoStart && activeSteps.size > 0)) return;

    const timeouts: NodeJS.Timeout[] = [];

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setActiveSteps(prev => new Set([...prev, step.id]));
        
        // Check if this is the last step
        if (index === steps.length - 1) {
          const completeTimeout = setTimeout(() => {
            setIsComplete(true);
          }, step.duration || 300);
          timeouts.push(completeTimeout);
        }
      }, step.delay);
      
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [trigger, steps, autoStart, activeSteps.size]);

  const getStepClassName = (stepId: string, baseClassName: string = '') => {
    const step = steps.find(s => s.id === stepId);
    const isActive = activeSteps.has(stepId);
    
    if (!step) return baseClassName;
    
    return `${baseClassName} ${isActive ? step.className : 'opacity-0 translate-y-4'}`.trim();
  };

  const reset = () => {
    setActiveSteps(new Set());
    setIsComplete(false);
  };

  const triggerStep = (stepId: string) => {
    setActiveSteps(prev => new Set([...prev, stepId]));
  };

  return {
    activeSteps,
    isComplete,
    getStepClassName,
    reset,
    triggerStep,
    completedCount: activeSteps.size,
    totalCount: steps.length,
    progress: (activeSteps.size / steps.length) * 100
  };
};

export default useAnimationSequence;