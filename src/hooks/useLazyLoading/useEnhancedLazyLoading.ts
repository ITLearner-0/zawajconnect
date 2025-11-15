import { useEffect, useRef, useState, useCallback } from 'react';
import { PerformanceConfigService } from './services/performanceConfig';
import { IntersectionObserverService } from './services/observerService';

interface UseEnhancedLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  configType?: 'image' | 'matchList' | 'compatibility';
  enablePreload?: boolean;
}

export const useEnhancedLazyLoading = <T extends HTMLElement = HTMLDivElement>(
  options: UseEnhancedLazyLoadingOptions = {}
) => {
  const {
    threshold,
    rootMargin,
    triggerOnce = true,
    configType = 'image',
    enablePreload = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const elementRef = useRef<T>(null);
  const observerService = IntersectionObserverService.getInstance();
  const performanceConfig = PerformanceConfigService.getInstance();

  // Get performance-optimized config
  const config = (() => {
    switch (configType) {
      case 'matchList':
        return performanceConfig.getMatchListConfig();
      case 'compatibility':
        return performanceConfig.getCompatibilityConfig();
      default:
        return performanceConfig.getImageConfig();
    }
  })();

  const finalThreshold = threshold ?? config.threshold;
  const finalRootMargin = rootMargin ?? config.rootMargin;

  const handleIntersection = useCallback(
    (entry: IntersectionObserverEntry) => {
      const isVisible = entry.isIntersecting;
      setIsIntersecting(isVisible);

      if (isVisible && triggerOnce && !hasTriggered) {
        setHasTriggered(true);
      }

      // Preload logic for better UX
      if (enablePreload && isVisible && !isPreloading) {
        setIsPreloading(true);
        // Preload will be handled by parent component
      }
    },
    [triggerOnce, hasTriggered, enablePreload, isPreloading]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observerConfig = {
      threshold: finalThreshold,
      rootMargin: finalRootMargin,
    };

    observerService.observe(element, observerConfig, handleIntersection);

    return () => {
      observerService.unobserve(element, observerConfig);
    };
  }, [finalThreshold, finalRootMargin, handleIntersection]);

  const shouldLoad = triggerOnce ? hasTriggered || isIntersecting : isIntersecting;

  return {
    elementRef,
    isIntersecting,
    shouldLoad,
    isPreloading,
    config: {
      batchSize: config.batchSize,
      delay: config.delay,
      preloadDistance: config.preloadDistance,
    },
  };
};
