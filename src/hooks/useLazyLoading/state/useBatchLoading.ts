import { useEffect, useCallback, useRef } from 'react';
import { useLazyLoadingContext } from '../context/LazyLoadingContext';

interface UseBatchLoadingOptions {
  batchSize?: number;
  batchDelay?: number;
  enablePriorityQueue?: boolean;
}

export const useBatchLoading = (options: UseBatchLoadingOptions = {}) => {
  const { state, actions } = useLazyLoadingContext();
  const { batchSize = state.batchSize, batchDelay = 100, enablePriorityQueue = true } = options;

  const processingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Process loading queue in batches
  const processBatch = useCallback(() => {
    if (processingRef.current || state.loadingQueue.length === 0) return;

    processingRef.current = true;

    // Sort queue by priority if enabled
    const queueToProcess = [...state.loadingQueue];

    if (enablePriorityQueue) {
      queueToProcess.sort((a, b) => {
        const aPriority = a.includes('high-priority') ? 3 : a.includes('medium-priority') ? 2 : 1;
        const bPriority = b.includes('high-priority') ? 3 : b.includes('medium-priority') ? 2 : 1;
        return bPriority - aPriority;
      });
    }

    // Take batch from queue
    const currentBatch = queueToProcess.slice(0, batchSize);

    if (state.enableDebug) {
      console.log('Processing batch:', {
        batchSize: currentBatch.length,
        totalQueue: state.loadingQueue.length,
        batch: currentBatch,
      });
    }

    // Process batch (actual loading is handled by individual components)
    // This is mainly for coordination and timing

    setTimeout(() => {
      processingRef.current = false;

      // Schedule next batch if queue still has items
      if (state.loadingQueue.length > currentBatch.length) {
        timeoutRef.current = setTimeout(processBatch, batchDelay);
      }
    }, batchDelay);
  }, [state.loadingQueue, batchSize, batchDelay, enablePriorityQueue, state.enableDebug]);

  // Trigger batch processing when queue changes
  useEffect(() => {
    if (state.loadingQueue.length > 0 && !processingRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(processBatch, batchDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.loadingQueue.length, processBatch, batchDelay]);

  // Update batch size dynamically
  const updateBatchSize = useCallback(
    (newSize: number) => {
      actions.updateConfig({ batchSize: newSize });
    },
    [actions]
  );

  // Get current batch status
  const getBatchStatus = useCallback(() => {
    return {
      queueLength: state.loadingQueue.length,
      isProcessing: processingRef.current,
      batchSize,
      estimatedBatches: Math.ceil(state.loadingQueue.length / batchSize),
    };
  }, [state.loadingQueue.length, batchSize]);

  return {
    updateBatchSize,
    getBatchStatus,
    processBatch,
    batchSize,
  };
};
