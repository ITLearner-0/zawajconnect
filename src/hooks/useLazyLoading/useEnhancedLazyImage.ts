
import { useState, useEffect, useCallback } from 'react';
import { useEnhancedLazyLoading } from './useEnhancedLazyLoading';

interface UseEnhancedLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  maxRetries?: number;
  fallbackSources?: string[];
  enableProgressiveLoading?: boolean;
}

export const useEnhancedLazyImage = (
  src: string, 
  options: UseEnhancedLazyImageOptions = {}
) => {
  const {
    maxRetries = 3,
    fallbackSources = [],
    enableProgressiveLoading = false,
    ...lazyOptions
  } = options;

  const { elementRef, shouldLoad, config } = useEnhancedLazyLoading<HTMLDivElement>({
    ...lazyOptions,
    configType: 'image',
  });

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  // Performance tracking (development only)
  const trackLoadTime = useCallback((startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const loadTime = performance.now() - startTime;
      console.log(`Image loaded in ${loadTime.toFixed(2)}ms`);
    }
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    if (loadStartTime) {
      trackLoadTime(loadStartTime);
    }
  }, [loadStartTime, trackLoadTime]);

  const handleError = useCallback(() => {
    if (retryCount < maxRetries) {
      // Try fallback sources or retry
      const nextSource = fallbackSources[retryCount] || src;
      setRetryCount(prev => prev + 1);
      setImageSrc(nextSource);
    } else {
      setHasError(true);
      setIsLoaded(false);
    }
  }, [retryCount, maxRetries, fallbackSources, src]);

  useEffect(() => {
    if (shouldLoad && src && !imageSrc) {
      setLoadStartTime(performance.now());
      setImageSrc(src);
    }
  }, [shouldLoad, src, imageSrc]);

  // Progressive loading effect
  useEffect(() => {
    if (enableProgressiveLoading && shouldLoad && src) {
      // Create a low-quality placeholder URL
      const lowQualityUrl = src.includes('?') 
        ? `${src}&w=50&q=30` 
        : `${src}?w=50&q=30`;
      
      setImageSrc(lowQualityUrl);
      
      // Load full quality after a delay
      const timer = setTimeout(() => {
        setImageSrc(src);
      }, config.delay);

      return () => clearTimeout(timer);
    }
  }, [enableProgressiveLoading, shouldLoad, src, config.delay]);

  return {
    elementRef,
    imageSrc,
    isLoaded,
    hasError,
    shouldLoad,
    handleLoad,
    handleError,
    retryCount,
    isRetrying: retryCount > 0 && retryCount < maxRetries,
  };
};
