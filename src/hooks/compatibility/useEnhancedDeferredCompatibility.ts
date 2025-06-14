
import { useState, useEffect, useMemo, useCallback } from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { useEnhancedLazyLoading } from '@/hooks/useLazyLoading/useEnhancedLazyLoading';

interface UseEnhancedDeferredCompatibilityOptions {
  matches: CompatibilityMatch[];
  enableAdaptiveBatching?: boolean;
  prioritizeVerified?: boolean;
}

export const useEnhancedDeferredCompatibility = ({
  matches,
  enableAdaptiveBatching = true,
  prioritizeVerified = true,
}: UseEnhancedDeferredCompatibilityOptions) => {
  const [processedCount, setProcessedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<CompatibilityMatch[]>([]);

  const { elementRef, shouldLoad, config } = useEnhancedLazyLoading<HTMLDivElement>({
    configType: 'compatibility',
    triggerOnce: false,
  });

  // Sort matches with verified profiles prioritized
  const sortedMatches = useMemo(() => {
    if (!prioritizeVerified) return matches;
    
    return [...matches].sort((a, b) => {
      const aVerified = a.profileData?.email_verified || a.profileData?.phone_verified || false;
      const bVerified = b.profileData?.email_verified || b.profileData?.phone_verified || false;
      
      if (aVerified && !bVerified) return -1;
      if (!aVerified && bVerified) return 1;
      return b.score - a.score; // Fallback to score sorting
    });
  }, [matches, prioritizeVerified]);

  // Adaptive batch processing
  const processBatch = useCallback(async () => {
    if (isProcessing || processedCount >= sortedMatches.length) return;

    setIsProcessing(true);
    
    const batchSize = enableAdaptiveBatching 
      ? Math.min(config.batchSize, sortedMatches.length - processedCount)
      : config.batchSize;

    // Simulate processing time based on device capabilities
    await new Promise(resolve => setTimeout(resolve, config.delay));
    
    setProcessedCount(prev => Math.min(prev + batchSize, sortedMatches.length));
    setIsProcessing(false);
  }, [isProcessing, processedCount, sortedMatches.length, enableAdaptiveBatching, config]);

  // Process matches when component becomes visible
  useEffect(() => {
    if (!shouldLoad || processedCount >= sortedMatches.length) return;
    
    processBatch();
  }, [shouldLoad, processedCount, sortedMatches.length, processBatch]);

  // Preload next batch when user is close to the end
  useEffect(() => {
    const shouldPreload = processedCount > 0 && 
      (processedCount / sortedMatches.length) > 0.7 && 
      processedCount < sortedMatches.length;

    if (shouldPreload && !isProcessing) {
      const remainingMatches = sortedMatches.slice(processedCount, processedCount + config.preloadDistance);
      setProcessingQueue(remainingMatches);
    }
  }, [processedCount, sortedMatches, isProcessing, config.preloadDistance]);

  const visibleMatches = useMemo(() => {
    return sortedMatches.slice(0, processedCount);
  }, [sortedMatches, processedCount]);

  const hasMore = processedCount < sortedMatches.length;
  const progress = sortedMatches.length > 0 ? (processedCount / sortedMatches.length) * 100 : 100;

  return {
    elementRef,
    visibleMatches,
    isProcessing,
    hasMore,
    progress,
    totalMatches: sortedMatches.length,
    processedCount,
    processingQueue: processingQueue.length,
    loadMoreBatch: processBatch,
  };
};
