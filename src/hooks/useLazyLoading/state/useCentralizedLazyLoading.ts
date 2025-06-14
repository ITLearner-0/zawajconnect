
import { useCallback, useEffect, useRef } from 'react';
import { useLazyLoadingContext } from '../context/LazyLoadingContext';
import { useEnhancedLazyLoading } from '../useEnhancedLazyLoading';

interface UseCentralizedLazyLoadingOptions {
  id: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  configType?: 'image' | 'matchList' | 'compatibility';
  enablePreload?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const useCentralizedLazyLoading = <T extends HTMLElement = HTMLDivElement>(
  options: UseCentralizedLazyLoadingOptions
) => {
  const { state, actions } = useLazyLoadingContext();
  const { id, priority = 'medium', ...lazyOptions } = options;
  const loadStartTime = useRef<number>();
  
  const { elementRef, isIntersecting, shouldLoad, config } = useEnhancedLazyLoading<T>(lazyOptions);

  // Track loading state in global context
  useEffect(() => {
    if (shouldLoad && !state.loadedItems.has(id) && !state.failedItems.has(id)) {
      actions.addToQueue(id);
      loadStartTime.current = performance.now();
    }
  }, [shouldLoad, id, actions, state.loadedItems, state.failedItems]);

  // Mark as loaded
  const markAsLoaded = useCallback(() => {
    if (loadStartTime.current) {
      const loadTime = performance.now() - loadStartTime.current;
      // Update the state's averageLoadTime directly
      actions.updateConfig({ 
        averageLoadTime: (state.averageLoadTime + loadTime) / 2 
      });
    }
    actions.markLoaded(id);
  }, [id, actions, state.averageLoadTime]);

  // Mark as failed
  const markAsFailed = useCallback(() => {
    actions.markFailed(id);
  }, [id, actions]);

  // Check if item is already loaded or failed
  const isLoaded = state.loadedItems.has(id);
  const hasFailed = state.failedItems.has(id);
  const isLoading = state.loadingQueue.includes(id);

  // Priority-based loading
  const effectiveShouldLoad = useCallback(() => {
    if (isLoaded || hasFailed) return false;
    
    // High priority items load immediately when in view
    if (priority === 'high') return shouldLoad;
    
    // Medium priority items respect batch size
    if (priority === 'medium') {
      const highPriorityCount = state.loadingQueue.filter(item => 
        item.includes('high-priority')).length;
      return shouldLoad && (state.loadingQueue.length - highPriorityCount) < state.batchSize;
    }
    
    // Low priority items load only when queue is small
    return shouldLoad && state.loadingQueue.length < Math.floor(state.batchSize / 2);
  }, [shouldLoad, priority, isLoaded, hasFailed, state.loadingQueue, state.batchSize]);

  return {
    elementRef,
    isIntersecting,
    shouldLoad: effectiveShouldLoad(),
    isLoaded,
    hasFailed,
    isLoading,
    markAsLoaded,
    markAsFailed,
    config,
    globalState: state,
  };
};
