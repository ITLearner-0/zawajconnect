
import { useState, useEffect, useMemo } from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { useLazyLoading } from '@/hooks/useLazyLoading';

interface UseDeferredCompatibilityOptions {
  matches: CompatibilityMatch[];
  batchSize?: number;
  delay?: number;
}

export const useDeferredCompatibility = ({
  matches,
  batchSize = 10,
  delay = 100,
}: UseDeferredCompatibilityOptions) => {
  const [processedCount, setProcessedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { elementRef, shouldLoad } = useLazyLoading<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Process matches in batches when component is visible
  useEffect(() => {
    if (!shouldLoad || processedCount >= matches.length) return;

    setIsProcessing(true);
    const timeoutId = setTimeout(() => {
      setProcessedCount(prev => Math.min(prev + batchSize, matches.length));
      setIsProcessing(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [shouldLoad, processedCount, matches.length, batchSize, delay]);

  const visibleMatches = useMemo(() => {
    return matches.slice(0, processedCount);
  }, [matches, processedCount]);

  const hasMore = processedCount < matches.length;
  const progress = matches.length > 0 ? (processedCount / matches.length) * 100 : 100;

  return {
    elementRef,
    visibleMatches,
    isProcessing,
    hasMore,
    progress,
    totalMatches: matches.length,
    processedCount,
  };
};
