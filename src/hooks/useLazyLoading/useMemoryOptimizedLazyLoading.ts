import { useEffect, useRef, useState, useCallback } from 'react';
import { IntersectionObserverService } from './services/observerService';
import { MemoryManagementService } from './services/memoryService';

interface UseMemoryOptimizedLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  enableMemoryCleanup?: boolean;
  unloadDelay?: number;
}

export const useMemoryOptimizedLazyLoading = <T extends HTMLElement = HTMLDivElement>(
  options: UseMemoryOptimizedLazyLoadingOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    enableMemoryCleanup = true,
    unloadDelay = 5000,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const elementRef = useRef<T>(null);
  const unloadTimeoutRef = useRef<number>();

  const observerService = IntersectionObserverService.getInstance();
  const memoryService = enableMemoryCleanup ? MemoryManagementService.getInstance() : null;

  const handleIntersection = useCallback(
    (entry: IntersectionObserverEntry) => {
      const isVisible = entry.isIntersecting;
      setIsIntersecting(isVisible);

      if (isVisible) {
        if (triggerOnce && !hasTriggered) {
          setHasTriggered(true);
        }

        // Cancel any pending unload
        if (unloadTimeoutRef.current) {
          clearTimeout(unloadTimeoutRef.current);
          unloadTimeoutRef.current = undefined;
        }
      } else if (enableMemoryCleanup && !triggerOnce && isContentLoaded) {
        // Schedule content unload after delay
        unloadTimeoutRef.current = window.setTimeout(() => {
          if (!isIntersecting) {
            setIsContentLoaded(false);
            if (process.env.NODE_ENV === 'development') {
              console.log('Unloaded content to save memory');
            }
          }
        }, unloadDelay);
      }
    },
    [triggerOnce, hasTriggered, enableMemoryCleanup, isContentLoaded, unloadDelay, isIntersecting]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observerConfig = {
      threshold,
      rootMargin,
    };

    observerService.observe(element, observerConfig, handleIntersection);

    return () => {
      observerService.unobserve(element, observerConfig);
      if (unloadTimeoutRef.current) {
        clearTimeout(unloadTimeoutRef.current);
      }
    };
  }, [threshold, rootMargin, handleIntersection]);

  // Mark content as loaded
  const markContentLoaded = useCallback(() => {
    setIsContentLoaded(true);
  }, []);

  const shouldLoad = triggerOnce ? hasTriggered || isIntersecting : isIntersecting;
  const shouldShowContent = enableMemoryCleanup ? shouldLoad && isContentLoaded : shouldLoad;

  return {
    elementRef,
    isIntersecting,
    shouldLoad,
    shouldShowContent,
    markContentLoaded,
    memoryStats: memoryService?.getMemoryStats(),
  };
};
